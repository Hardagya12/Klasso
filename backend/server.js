require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./src/db/neon');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

const dummyRouter = express.Router();
dummyRouter.all('*', (req, res) => res.json({ message: 'Endpoint not implemented yet' }));

const safeRequire = (path) => {
    try {
        return require(path);
    } catch (e) {
        return dummyRouter;
    }
};

app.use('/api/auth', safeRequire('./src/routes/auth'));
app.use('/api/users', safeRequire('./src/routes/users'));
app.use('/api/schools', safeRequire('./src/routes/schools'));
app.use('/api/classes', safeRequire('./src/routes/classes'));
app.use('/api/students', safeRequire('./src/routes/students'));
app.use('/api/subjects', safeRequire('./src/routes/subjects'));
app.use('/api/attendance', safeRequire('./src/routes/attendance'));
app.use('/api/exams', safeRequire('./src/routes/exams'));
app.use('/api/marks', safeRequire('./src/routes/marks'));
app.use('/api/reports', safeRequire('./src/routes/reports'));
app.use('/api/timetable', safeRequire('./src/routes/timetable'));
app.use('/api/assignments', safeRequire('./src/routes/assignments'));
app.use('/api/announcements', safeRequire('./src/routes/announcements'));
app.use('/api/notifications', safeRequire('./src/routes/notifications'));
app.use('/api/analytics', safeRequire('./src/routes/analytics'));
app.use('/api/documents', safeRequire('./src/routes/documents'));
app.use('/api/fees', safeRequire('./src/routes/fees'));
app.use('/api/events', safeRequire('./src/routes/events'));
app.use('/api/study-materials', safeRequire('./src/routes/study-materials'));
app.use('/api/lesson-plans', safeRequire('./src/routes/lesson-plans'));
app.use('/api/messages', safeRequire('./src/routes/messages'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 3001;

testConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
});
