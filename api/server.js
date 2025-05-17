
// server.js - Main server file
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', async(req, res) => {
    res.send('Hello World from Express!');
})

// Routes
// 2. Get all videos
app.get('/api/videos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Get a specific video
app.get('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Add an issue to a video
app.post('/api/videos/:videoId/issues', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { description, timestamp, severity } = req.body;

        const { data, error } = await supabase
        .from('issues')
        .insert([
            {
            video_id: videoId,
            description,
            timestamp,
            severity
            }
        ])
        .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Get all issues for a video
app.get('/api/videos/:videoId/issues', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('video_id', videoId)
        .order('timestamp', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Update an issue
app.put('/api/issues/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, timestamp, severity, resolved } = req.body;

        const { data, error } = await supabase
        .from('issues')
        .update({ description, timestamp, severity, resolved })
        .eq('id', id)
        .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Delete an issue
app.delete('/api/issues/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Mark a task as complete
app.put('/api/tasks/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: new Date() })
        .eq('id', id)
        .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            video:video_id (*)
        `)
        .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});