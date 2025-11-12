import admin from 'firebase-admin';

function initAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initAdmin();
    const db = admin.firestore();
    
    // Get all users
    const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt,
        formId: userData.formId,
        submissionId: userData.submissionId
      });
    });

    // Get stamp statistics
    const stampsSnapshot = await db.collection('stamps').get();
    const stampStats = {
      totalUsers: users.length,
      totalStampCards: stampsSnapshot.size,
      recentSubmissions: users.slice(0, 10) // Last 10 submissions
    };

    // Return HTML dashboard
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Registration Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f5f5f5;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .stat-card { 
            background: #007bff; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
        }
        .stat-number { 
            font-size: 2em; 
            font-weight: bold; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd;
        }
        th { 
            background: #f8f9fa; 
            font-weight: bold;
        }
        tr:hover { 
            background: #f8f9fa; 
        }
        .email { 
            color: #007bff; 
        }
        .timestamp { 
            color: #666; 
            font-size: 0.9em;
        }
        .refresh-btn {
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
        }
        .refresh-btn:hover {
            background: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Registration Dashboard</h1>
        <button class="refresh-btn" onclick="window.location.reload()">🔄 Refresh</button>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${stampStats.totalUsers}</div>
                <div>Total Registrations</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stampStats.totalStampCards}</div>
                <div>Stamp Cards Created</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${new Date().toLocaleDateString()}</div>
                <div>Last Updated</div>
            </div>
        </div>

        <h2>📧 Recent Submissions</h2>
        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Registration Time</th>
                    <th>User ID</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td class="email">${user.email || 'N/A'}</td>
                        <td>${user.name || 'N/A'}</td>
                        <td class="timestamp">${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</td>
                        <td><code>${user.id}</code></td>
                        <td>
                            <a href="/stamps?id=${user.id}" target="_blank" style="color: #007bff;">View Stamps</a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3>📱 Access Links</h3>
            <p><strong>FormSG Form:</strong> <a href="https://form.gov.sg/6911b9ea7b7a150c5e112447" target="_blank">https://form.gov.sg/6911b9ea7b7a150c5e112447</a></p>
            <p><strong>Stamp Collection App:</strong> <a href="/stamps" target="_blank">https://registration-smoky-chi.vercel.app/stamps</a></p>
            <p><strong>Test Webhook:</strong> <a href="/api/formsg-test" target="_blank">https://registration-smoky-chi.vercel.app/api/formsg-test</a></p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 0.9em;">
            Last updated: ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      error: 'Failed to load dashboard',
      message: error.message
    });
  }
}