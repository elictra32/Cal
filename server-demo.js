/**
 * ThusHouse Academy - Backend Demo Server
 * Simple Express.js mock server for demonstration
 * 
 * Usage:
 *   node server-demo.js
 * 
 * Then visit: http://localhost:5000/api
 */

const http = require('http');
const url = require('url');

// Mock database
const mockDB = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@thushouse.com',
      password: 'password123', // In real app, use bcryptjs
      role: 'admin',
      createdAt: new Date('2024-01-01')
    }
  ],
  videos: [
    {
      id: 1,
      title: 'Trading Foundation',
      description: 'พื้นฐานการเทรดเบื้องต้น',
      duration: '4:32',
      price: 2900,
      instructor: 'สมชาย ศรีทำไทย',
      students: 145,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Fundamental Investing',
      description: 'การลงทุนแบบพื้นฐาน',
      duration: '3:15',
      price: 2500,
      instructor: 'วิลาส ชัยวัฒน์',
      students: 102,
      rating: 4.6
    },
    {
      id: 3,
      title: 'Trading Psychology',
      description: 'จิตวิทยาการเทรด',
      duration: '2:48',
      price: 1900,
      instructor: 'สมชาย ศรีทำไทย',
      students: 87,
      rating: 4.7
    },
    {
      id: 4,
      title: 'Advanced Trading',
      description: 'เทคนิคเทรดขั้นสูง',
      duration: '5:20',
      price: 3500,
      instructor: 'ประเสริฐ ทองคำ',
      students: 56,
      rating: 4.9
    }
  ],
  students: [
    { id: 1, name: 'สมศักดิ์ ใจดี', email: 'som@example.com', enrolledCourses: 3, progress: 65 },
    { id: 2, name: 'นิศา สวยใจ', email: 'nisa@example.com', enrolledCourses: 2, progress: 40 },
    { id: 3, name: 'อรุณ ทองสุข', email: 'arun@example.com', enrolledCourses: 4, progress: 80 }
  ],
  teachers: [
    { id: 1, name: 'สมชาย ศรีทำไทย', expertise: 'Trading', courses: 2 },
    { id: 2, name: 'วิลาส ชัยวัฒน์', expertise: 'Investing', courses: 1 },
    { id: 3, name: 'ประเสริฐ ทองคำ', expertise: 'Advanced Trading', courses: 1 }
  ]
};

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '✅ ThusHouse Academy API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth/login, /api/auth/register, /api/auth/verify',
        videos: '/api/videos, /api/videos/:id',
        students: '/api/students, /api/students/:id',
        teachers: '/api/teachers, /api/teachers/:id',
        dashboard: '/api/dashboard'
      }
    }));
    return;
  }

  // ==================== AUTH ====================
  if (pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = mockDB.users.find(u => u.email === data.email && u.password === data.password);
        
        if (user) {
          const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
          res.writeHead(200);
          res.end(JSON.stringify({
            message: '✅ Login successful',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({ message: '❌ Invalid email or password' }));
        }
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: '❌ Invalid request' }));
      }
    });
    return;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newUser = {
          id: mockDB.users.length + 1,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role || 'student',
          createdAt: new Date()
        };
        mockDB.users.push(newUser);
        
        res.writeHead(201);
        res.end(JSON.stringify({
          message: '✅ Registration successful',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: '❌ Invalid request' }));
      }
    });
    return;
  }

  if (pathname === '/api/auth/verify' && method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '✅ Token verified',
      verified: true
    }));
    return;
  }

  // ==================== VIDEOS ====================
  if (pathname === '/api/videos' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '✅ Videos retrieved',
      count: mockDB.videos.length,
      data: mockDB.videos
    }));
    return;
  }

  if (pathname.startsWith('/api/videos/') && method === 'GET') {
    const id = parseInt(pathname.split('/')[3]);
    const video = mockDB.videos.find(v => v.id === id);
    
    if (video) {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '✅ Video retrieved',
        data: video
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: '❌ Video not found' }));
    }
    return;
  }

  // ==================== STUDENTS ====================
  if (pathname === '/api/students' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '✅ Students retrieved',
      count: mockDB.students.length,
      data: mockDB.students
    }));
    return;
  }

  if (pathname.startsWith('/api/students/') && method === 'GET') {
    const id = parseInt(pathname.split('/')[3]);
    const student = mockDB.students.find(s => s.id === id);
    
    if (student) {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '✅ Student retrieved',
        data: student
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: '❌ Student not found' }));
    }
    return;
  }

  // ==================== TEACHERS ====================
  if (pathname === '/api/teachers' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '✅ Teachers retrieved',
      count: mockDB.teachers.length,
      data: mockDB.teachers
    }));
    return;
  }

  if (pathname.startsWith('/api/teachers/') && method === 'GET') {
    const id = parseInt(pathname.split('/')[3]);
    const teacher = mockDB.teachers.find(t => t.id === id);
    
    if (teacher) {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '✅ Teacher retrieved',
        data: teacher
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: '❌ Teacher not found' }));
    }
    return;
  }

  // ==================== DASHBOARD ====================
  if (pathname === '/api/dashboard' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '✅ Dashboard data retrieved',
      data: {
        stats: {
          totalStudents: mockDB.students.length,
          totalVideos: mockDB.videos.length,
          totalTeachers: mockDB.teachers.length,
          totalHours: 324,
          recentEnrollments: 12
        },
        topCourses: mockDB.videos.slice(0, 4),
        recentStudents: mockDB.students.slice(0, 3)
      }
    }));
    return;
  }

  // ==================== NOT FOUND ====================
  res.writeHead(404);
  res.end(JSON.stringify({
    message: '❌ Endpoint not found',
    hint: 'Visit /api for available endpoints'
  }));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   ThusHouse Academy - Backend Demo    ║
╚═══════════════════════════════════════╝

✅ Server running on: http://localhost:${PORT}

📚 API Endpoints:
  GET  /api                      → List all endpoints
  GET  /api/dashboard            → Dashboard stats
  
  POST /api/auth/login           → Login with email/password
  POST /api/auth/register        → Register new user
  POST /api/auth/verify          → Verify token
  
  GET  /api/videos               → List all videos
  GET  /api/videos/:id           → Get video by ID
  
  GET  /api/students             → List all students
  GET  /api/students/:id         → Get student by ID
  
  GET  /api/teachers             → List all teachers
  GET  /api/teachers/:id         → Get teacher by ID

📝 Test Credentials:
  Email: admin@thushouse.com
  Password: password123

🔗 Try it:
  curl http://localhost:${PORT}/api
  curl http://localhost:${PORT}/api/videos
  curl http://localhost:${PORT}/api/dashboard

💡 To connect with Frontend:
  Update Frontend API_BASE to: http://localhost:${PORT}/api

🌐 Frontend Demo: https://claude.ai/artifact/...

Press Ctrl+C to stop the server
`);
});
