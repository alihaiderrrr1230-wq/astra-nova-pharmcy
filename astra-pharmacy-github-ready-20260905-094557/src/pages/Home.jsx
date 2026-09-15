// جيب 20 دواء
.slice(0, 20); // ← CHANGED FROM 4 TO 20

// State للدوران
const [topSellingIndex, setTopSellingIndex] = useState(0);

// تحديث الـ index كل 10 ثواني
useEffect(() => {
  const interval = setInterval(() => {
    setTopSellingIndex((prev) => (prev + 4) % topSelling.length);
  }, 10000); // 10 SECONDS
  return () => clearInterval(interval);
}, [topSelling.length]);

// عرض 4 فقط من الـ 20
const displayedTopSelling = topSelling.slice(
  topSellingIndex,
  topSellingIndex + 4
);
