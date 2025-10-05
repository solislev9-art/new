const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get comments for a manga/chapter
router.get('/:mangaId/:chapterId?', optionalAuth, async (req, res) => {
  try {
    const { mangaId, chapterId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT c.*, u.username, u.id as user_id,
             COUNT(cl.id) as like_count,
             CASE WHEN $1::integer IS NOT NULL THEN 
               EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = $1)
             ELSE false END as user_liked
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      WHERE c.manga_id = $2
    `;

    const queryParams = [req.user?.id || null, mangaId];
    let paramCount = 2;

    if (chapterId) {
      paramCount++;
      queryText += ` AND c.chapter_id = $${paramCount}`;
      queryParams.push(chapterId);
    }

    queryText += `
      GROUP BY c.id, u.username, u.id
      ORDER BY c.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM comments WHERE manga_id = $1';
    const countParams = [mangaId];

    if (chapterId) {
      countQuery += ' AND chapter_id = $2';
      countParams.push(chapterId);
    }

    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      comments: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new comment
router.post('/', authenticateToken, [
  body('content').isLength({ min: 1, max: 1000 }).trim(),
  body('mangaId').isInt(),
  body('chapterId').optional().isInt(),
  body('parentId').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, mangaId, chapterId, parentId } = req.body;
    const userId = req.user.id;

    // Verify manga exists
    const mangaCheck = await query('SELECT id FROM manga WHERE id = $1', [mangaId]);
    if (mangaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    // Verify chapter exists if provided
    if (chapterId) {
      const chapterCheck = await query(
        'SELECT id FROM chapters WHERE id = $1 AND manga_id = $2',
        [chapterId, mangaId]
      );
      if (chapterCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Chapter not found' });
      }
    }

    // Verify parent comment exists if provided
    if (parentId) {
      const parentCheck = await query(
        'SELECT id FROM comments WHERE id = $1 AND manga_id = $2',
        [parentId, mangaId]
      );
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const result = await query(`
      INSERT INTO comments (manga_id, chapter_id, user_id, parent_id, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [mangaId, chapterId || null, userId, parentId || null, content]);

    // Get the comment with user info
    const commentResult = await query(`
      SELECT c.*, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentResult.rows[0]
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a comment
router.put('/:id', authenticateToken, [
  body('content').isLength({ min: 1, max: 1000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const commentId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if comment exists and user owns it
    const commentCheck = await query(
      'SELECT id, user_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (commentCheck.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const result = await query(`
      UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [content, commentId]);

    res.json({
      message: 'Comment updated successfully',
      comment: result.rows[0]
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if comment exists and user owns it
    const commentCheck = await query(
      'SELECT id, user_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (commentCheck.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await query('DELETE FROM comments WHERE id = $1', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/unlike a comment
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if comment exists
    const commentCheck = await query('SELECT id FROM comments WHERE id = $1', [commentId]);
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user already liked this comment
    const likeCheck = await query(
      'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );

    if (likeCheck.rows.length > 0) {
      // Unlike
      await query(
        'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        [commentId, userId]
      );
      
      res.json({ message: 'Comment unliked', liked: false });
    } else {
      // Like
      await query(
        'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
        [commentId, userId]
      );
      
      res.json({ message: 'Comment liked', liked: true });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;