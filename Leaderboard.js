// Leaderboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';

let database = [];

function generateRandomUsername() {
  const words = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
  let name = '';
  for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
    name += words[Math.floor(Math.random() * words.length)] + ' ';
  }
  return name.trim();
}

function generateRandomScore() {
  return Math.floor(Math.random() * 1000);
}

function initializeLeaderboard() {
  for (let i = 0; i < 1000; i++) {
    database.push({
      username: generateRandomUsername(),
      score: generateRandomScore(),
    });
  }
  database.sort((a, b) => b.score - a.score);
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    initializeLeaderboard();
    setLeaderboard(database);

    // Set up the daily update at 00:00 Vietnamese time
    const now = new Date();
    const midnightVN = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Next day
      0, // 00 hours
      0, // 00 minutes
      0 // 00 seconds
    ).getTime();

    const timeUntilMidnight = midnightVN - now.getTime();
    setTimeout(() => {
      updateLeaderboard();
      setInterval(() => {
        updateLeaderboard();
      }, 24 * 60 * 60 * 1000); // Update every 24 hours
    }, timeUntilMidnight);

  }, []);

  const updateLeaderboard = () => {
    // Generate new scores for each user
    for (let i = 0; i < database.length; i++) {
      database[i].score += Math.floor(Math.random() * 1000);
    }
    
    // Sort the leaderboard by score in descending order
    database.sort((a, b) => b.score - a.score);

    // Update the state to trigger a re-render
    setLeaderboard([...database]);
  };

  return (
    <View>
      <FlatList
        data={leaderboard}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View>
            <Text>{`#${index + 1} ${item.username}: ${item.score}`}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Leaderboard;
