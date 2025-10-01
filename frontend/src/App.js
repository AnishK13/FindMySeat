import React, { useEffect, useState } from 'react';
import SeatMap from './components/SeatMap';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [seatEs, setSeatEs] = useState(null);
  const [duration, setDuration] = useState(1);
  const [coords, setCoords] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginType, setLoginType] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/profile', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          const userRole = data.user.role;
          setLoginType(userRole === 'admin' ? 'admin' : 'student');
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user && loginType === 'student' && !coords) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => alert('Location required to book a seat!')
      );
    }
  }, [user, loginType, coords]);

  useEffect(() => {
    if (user && loginType === 'student') {
      fetch('http://localhost:5000/api/seats', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setSeats(data));
    }
  }, [user, loginType]);

  useEffect(() => {
    if (user && loginType === 'student') {
      const es = new EventSource('http://localhost:5000/events/seats', { withCredentials: true });
      setSeatEs(es);

      es.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.type === 'seat-delta' && msg.delta) {
            const { seatId, status } = msg.delta;
            setSeats(prev => prev.map(s => s.seatId === seatId ? { ...s, status } : s));
          }
        } catch (e) {
          console.error('Seat SSE parse error', e);
        }
      };

      es.onerror = () => {
        // Let browser handle reconnection
      };

      return () => {
        es.close();
      };
    }
  }, [user, loginType]);

  const handleStudentLogin = () => {
    setLoginType('student');
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleAdminLogin = () => {
    setLoginType('admin');
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleLogout = () => {
    fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include'
    }).finally(() => {
      setUser(null);
      setLoginType(null);
      setSeats([]);
      setSelectedSeatId(null);
      setCoords(null);
      setBooking(null);
      
      window.location.replace('http://localhost:3000');
    });
  };

  const handleBook = () => {
    if (!selectedSeatId || !duration || !coords) return;
    fetch('http://localhost:5000/api/seats/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ seatId: selectedSeatId, duration, userLat: coords.lat, userLon: coords.lon })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setSelectedSeatId(null);
        fetch('http://localhost:5000/api/seats', { credentials: 'include' })
          .then(res => res.json())
          .then(data => setSeats(data));
      });
  };

  const handleCancel = () => {
    fetch('http://localhost:5000/api/seats/cancel', {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        fetch('http://localhost:5000/api/seats', { credentials: 'include' })
          .then(res => res.json())
          .then(data => setSeats(data));
      });
  };

  if (loading) return <div className="text-center mt-20 text-xl font-semibold">Loading...</div>;
  
  if (!user || !loginType) {
    return <LandingPage onStudentLogin={handleStudentLogin} onAdminLogin={handleAdminLogin} />;
  }

  if (loginType === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  if (loginType === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex flex-col items-center">
        <header className="w-full bg-blue-700 text-white py-4 shadow mb-8">
          <div className="flex justify-between items-center max-w-4xl mx-auto px-4">
            <div>
              <h1 className="text-3xl font-bold tracking-wide">FindMySeat</h1>
              <p className="text-blue-100 mt-1">Smart Reading Hall Seat Booking</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex flex-col items-center w-full max-w-4xl px-4">
          <div className="mb-8 w-full flex flex-col items-center">
            <SeatMap seats={seats} onSeatSelect={setSelectedSeatId} selectedSeatId={selectedSeatId} />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow border border-gray-200">
            <label className="font-medium">Duration (hours):</label>
            <input type="number" min={1} max={6} value={duration} onChange={e => setDuration(Number(e.target.value))} className="border rounded px-2 py-1 w-20 text-center" />
            <button onClick={handleBook} disabled={!selectedSeatId || !coords} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
              Book Selected Seat
            </button>
            <button onClick={handleCancel} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition">
              Cancel My Booking
            </button>
          </div>
        </main>
        <footer className="mt-auto py-4 text-center text-gray-500 text-sm w-full">&copy; {new Date().getFullYear()} FindMySeat</footer>
      </div>
    );
  }

  return <LandingPage onStudentLogin={handleStudentLogin} onAdminLogin={handleAdminLogin} />;
}

export default App;
