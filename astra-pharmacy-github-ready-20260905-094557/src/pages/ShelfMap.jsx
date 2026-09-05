import React from 'react';
import { Grid3x3 } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import ShelfMapComponent from '../components/ShelfMap.jsx';

export default function ShelfMap() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Grid3x3 size={20} />
        <h1 className="text-2xl font-extrabold">خريطة الأرفف</h1>
        <span className="chip chip-cyan">مستقلة</span>
      </div>
      <GlassCard className="p-5" strong>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          اختر أي صنف من شريط البحث الشامل بالأعلى ليُضيء موقعه على الخريطة.
          أو استخدم بطاقة "رف" بالصندوق لمعرفة ما يحتويه.
        </p>
        <ShelfMapComponent />
      </GlassCard>
    </div>
  );
}
