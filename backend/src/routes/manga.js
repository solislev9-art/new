const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all manga with pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const genre = req.query.genre || '';

    let queryText = `
      SELECT m.*, 
             COUNT(c.id) as chapter_count,
             AVG(r.rating) as avg_rating
      FROM manga m
      LEFT JOIN chapters c ON m.id = c.manga_id
      LEFT JOIN ratings r ON m.id = r.manga_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      queryText += ` AND (m.title ILIKE $${paramCount} OR m.author ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (genre) {
      paramCount++;
      queryText += ` AND m.genre ILIKE $${paramCount}`;
      queryParams.push(`%${genre}%`);
    }

    queryText += `
      GROUP BY m.id
      ORDER BY m.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM manga WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (title ILIKE $${countParamCount} OR author ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (genre) {
      countParamCount++;
      countQuery += ` AND genre ILIKE $${countParamCount}`;
      countParams.push(`%${genre}%`);
    }

    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      manga: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get manga error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single manga by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const mangaId = req.params.id;

    const result = await query(`
      SELECT m.*, 
             COUNT(c.id) as chapter_count,
             AVG(r.rating) as avg_rating
      FROM manga m
      LEFT JOIN chapters c ON m.id = c.manga_id
      LEFT JOIN ratings r ON m.id = r.manga_id
      WHERE m.id = $1
      GROUP BY m.id
    `, [mangaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get manga by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chapters for a manga
router.get('/:id/chapters', async (req, res) => {
  try {
    const mangaId = req.params.id;

    const result = await query(`
      SELECT id, chapter_number, title, created_at
      FROM chapters
      WHERE manga_id = $1
      ORDER BY chapter_number ASC
    `, [mangaId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific chapter
router.get('/:id/chapters/:chapterId', async (req, res) => {
  try {
    const { id: mangaId, chapterId } = req.params;

    const result = await query(`
      SELECT c.*, m.title as manga_title
      FROM chapters c
      JOIN manga m ON c.manga_id = m.id
      WHERE c.manga_id = $1 AND c.id = $2
    `, [mangaId, chapterId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;