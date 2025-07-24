import { useEffect, useState } from 'react';

export default function UserCounter() {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Simulate fetching user count
    const count = Math.floor(Math.random() * 1000) + 500;
    setUserCount(count);
  }, []);

  return (
    <div className="text-sm text-gray-600">
      You are user #{userCount.toLocaleString()} to try this tool
    </div>
  );
}