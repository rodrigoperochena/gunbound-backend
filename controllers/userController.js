// controllers/userController.js
const { pool } = require('../utils/db');
const bcrypt = require('bcrypt');

// Country mapping to name
const countryMapping = {
  Peru: 157,
  Indonesia: 91,
  Argentina: 9,
  Brasil: 28,
  USA: 207,
};

// Register a new user
const registerUser = async (req, res) => {
  const { 
    username, 
    password, 
    email, 
    gender, 
    country,
    defaultDateTime = '0000-00-00 00:00:00',
    adminToken
  } = req.body;

  // Secure admin token stored in environment variables
  const validAdminToken = process.env.ADMIN_REGISTRATION_TOKEN;

  // // Check if the token matches
  const isAdmin = adminToken && adminToken === validAdminToken;

  // Default values
  const gold = isAdmin ? 900000 : 250000; // Admins get more gold, regular users start with 0
  const cash = isAdmin ? 900000 : 125000; // Admins get more cash, regular users start with 0
  const authority = isAdmin ? 100 : 1
  const authority2 = authority
  const authorityBackup = authority2
  const gamePoints = 1000; // Everyone starts with 1000 points
  const TotalGrade = isAdmin ? 20 : 19; // Admin rank is 1, beginner rank is 20
  const SeasonGrade = TotalGrade // Match TotalGrade at registration
  const CountryGrade = TotalGrade

  // Validate input
  if (!username || !password || !email || !gender || !country) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Convert gender to numeric format (0 = male, 1 = female)
    const genderValue = gender === 'Male' ? 0 : 1;

    // Convert country to numeric format using mapping
    const countryValue = countryMapping[country];
    if (!countryValue) {
      return res.status(400).json({ message: 'Invalid country selected' });
    }

    // Check if user already exists
    pool.query(
      'SELECT * FROM user WHERE user = ? OR E_Mail = ?',
      [username, email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        // Check if username already exists
        const existingUsername = results.find(user => user.user === username);
        if (existingUsername) {
          return res.status(409).json({ message: 'This username is already taken. Please choose another.' });
        }

        // Check if email already exists
        const existingEmail = results.find(user => user.E_Mail === email);
        if (existingEmail) {
          return res.status(409).json({ message: 'This email is already in use. Did you mean to log in instead?' });
        }
    
        // // Hash the password // UPDATE: Gunbound server do not support it 😥
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Begin transaction
        pool.getConnection((err, connection) => {
          if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
          }

          connection.beginTransaction((err) => {
            if (err) {
              connection.release();
              return res.status(500).json({ message: 'Transaction error', error: err });
            }

            // Insert into user table
            connection.query(
              `INSERT INTO user (Id, user, NickName, Password, E_Mail, Gender, Country, MuteTime, RestrictTime, Status, User_Level, Authority, Authority2) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [username, username, username, password, email, genderValue, countryValue, defaultDateTime, defaultDateTime, '1', 1, authority, authority2],
              (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    return res.status(500).json({ message: 'Database error', error: err });
                  });
                }

                // Insert into gunwcuser table
                connection.query(
                  `INSERT INTO gunwcuser (Id, user, NickName, Password, E_Mail, Gender, Country, MuteTime, RestrictTime, Status, User_Level, Authority, Authority2, AuthorityBackup) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [username, username, username, password, email, genderValue, countryValue, defaultDateTime, defaultDateTime, '1', 1, authority, authority2, authorityBackup],
                  (err) => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        return res.status(500).json({ message: 'Database error', error: err });
                      });
                    }

                    // Insert into game table
                    connection.query(
                      `INSERT INTO game (Id, NickName, Guild, GuildRank, MemberCount, Money, EventScore0, EventScore1, EventScore2, EventScore3, AvatarWear, Prop1, Prop2, AdminGift, TotalScore, SeasonScore, TotalGrade, SeasonGrade, TotalRank, SeasonRank, AccumShot, AccumDamage, StageRecords, MobileRecords, LastUpdateTime, NoRankUpdate, ClientData, Country, CountryGrade, CountryRank, GiftProhibitTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                      [username, username, '', 0, 0, gold, 0, 0, 0, 0, 0, '', '', 0, gamePoints, gamePoints, TotalGrade, SeasonGrade, 0, 0, 0, 0, '0', '0', defaultDateTime, 0, '0', countryValue, CountryGrade, '0', defaultDateTime],
                      (err) => {
                        if (err) {
                          return connection.rollback(() => {
                            connection.release();
                            return res.status(500).json({ 
                              message: 'Database error', 
                              error: err 
                            })
                          })
                        }

                        connection.query(
                          `INSERT INTO cash (Id, Cash) 
                          VALUES (?, ?)`,
                          [username, cash],
                          (err) => {
                            if(err) {
                              return connection.rollback(() => {
                                connection.release()
                                return res.status(500).json({
                                  message: 'Database Error',
                                  error: err
                                })
                              })
                            }

                            // Commit transaction
                            connection.commit((err) => {
                              if (err) {
                                return connection.rollback(() => {
                                  connection.release();
                                  return res.status(500).json({ message: 'Commit error', error: err });
                                });
                              }

                              connection.release();
                              res.status(201).json({ success: true });
                            });
                          }
                        )
                      }
                    );
                  }
                );
              }
            );
          });
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Check users logins
const lastSeenUsers = (req, res) => {
  const serverPortNames = {
    8360: 'Avatar On',
    8361: 'Avatar Off',
  };

  // Determine the time filter
  const { days } = req.query;

  // Default to 7 days if no parameter is provided
  const interval = parseInt(days, 10) || 1; // Default to 7 days if 'days' is not provided or invalid

  // Validate the input to ensure it's a valid number
  if (isNaN(interval) || interval <= 0) {
    return res.status(400).json({ message: 'Invalid timeframe provided. It must be a positive number.' });
  }

  // Query to fetch last seen users
  pool.query(
    `SELECT 
      l.Id AS userId,
      MAX(l.Time) AS lastLoginTime,
      l.ServerPort AS serverPort,
      g.TotalGrade AS totalGrade
    FROM loginlog l
    LEFT JOIN game g ON l.Id = g.Id
    WHERE l.Time >= NOW() - INTERVAL ? DAY
    GROUP BY l.Id
    ORDER BY lastLoginTime DESC`,
    [interval],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.length === 0) {
        return res.status(200).json({ lastSeenUsers: [] }); // Return an empty array with 200 OK
      }      

      // Format results for the response
      const formattedResults = results.map((user) => ({
        id: user.userId,
        totalGrade: user.totalGrade,
        serverPort: serverPortNames[user.serverPort],
        lastLoginTime: new Date(user.lastLoginTime).toISOString(),
      }));

      res.status(200).json({ lastSeenUsers: formattedResults });
    }
  );
};

// Fetch all users
const getUsers = (req, res) => {
  const { id } = req.params; // Dynamic user ID from request params
  // Country mapping to emoji
  const countryMap = {
    157: 'Peru',
    91: 'Indonesia',
    9: 'Argentina',
    28: 'Brasil',
    207: 'USA',
  };
  
  // Utility to format money
  const formatMoney = (amount) =>
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0  
    }).format(amount);
  
  pool.query(
    `SELECT 
      g.Id AS userId,
      g.TotalGrade AS totalGrade,
      g.TotalScore AS totalScore,
      g.Money AS money,
      g.Country AS countryId,
      c.Cash AS cash,
      l.Time AS lastLoginTime
    FROM game g
    LEFT JOIN cash c ON g.Id = c.ID
    LEFT JOIN loginlog l ON g.Id = l.Id
    GROUP BY g.Id
    ORDER BY g.TotalScore DESC`,
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No user found' }); // Handle case if no user found
      }

      // Map and format result
      const response = results.map((user) => ({
        userId: user.userId,
        totalGrade: user.totalGrade,
        totalScore: user.totalScore,
        money: formatMoney(user.money),
        country: countryMap[user.countryId] || 'Unknown',
        cash: formatMoney(user.cash || 0), // Handle null cash gracefully
        lastLoginTime: user.lastLoginTime,
      }));
      console.log(results)
      res.status(200).json({ users: response }); // Send back the first result (user details)
    }
  );
};

const getUserById = (req, res) => {
  const { id } = req.params;

  const countryMap = {
    157: 'Peru',
    91: 'Indonesia',
    9: 'Argentina',
    28: 'Brasil',
    207: 'USA',
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);

  pool.query(
    `SELECT 
      g.Id AS userId,
      g.TotalGrade AS totalGrade,
      g.TotalScore AS totalScore,
      g.Money AS money,
      g.Country AS countryId,
      g.AccumShot AS winRate,
      c.Cash AS cash,
      MAX(l.Time) AS lastLoginTime
    FROM game g
    LEFT JOIN cash c ON g.Id = c.ID
    LEFT JOIN loginlog l ON g.Id = l.Id
    WHERE g.Id = ?
    GROUP BY g.Id`,
    [id],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = results[0];
      const response = {
        userId: user.userId,
        totalGrade: user.totalGrade,
        totalScore: user.totalScore,
        money: formatMoney(user.money),
        country: countryMap[user.countryId] || 'Unknown',
        winRate: user.winRate,
        cash: formatMoney(user.cash || 0),
        lastLoginTime: user.lastLoginTime,
      };

      res.status(200).json({ user: response });
    }
  );
};

module.exports = { registerUser, lastSeenUsers, getUsers, getUserById };