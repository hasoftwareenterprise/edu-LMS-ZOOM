const fs = require('fs');
const files = [
  'src/components/TeacherDashboard.tsx',
  'src/components/StudentDashboard.tsx',
  'src/layouts/DashboardLayout.tsx',
  'src/App.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/bg-white/g, 'bg-surface');
    content = content.replace(/bg-gray-50/g, 'bg-background');
    content = content.replace(/bg-gray-100/g, 'bg-sidebar-hover');
    content = content.replace(/border-black\/5/g, 'border-white\/5');
    content = content.replace(/border-black\/10/g, 'border-white\/10');
    content = content.replace(/shadow-black\/5/g, 'shadow-white\/5');
    content = content.replace(/text-black\/5/g, 'text-white\/5');
    content = content.replace(/text-black/g, 'text-white');
    content = content.replace(/bg-\[\#1e1e1e\]/g, 'bg-sidebar');
    content = content.replace(/bg-\[\#f1f3f5\]/g, 'bg-background');
    content = content.replace(/bg-\[\#e9ecef\]/g, 'bg-surface');
    content = content.replace(/bg-\[\#f8f9fa\]/g, 'bg-background');
    content = content.replace(/from-\[\#f1f3f5\]/g, 'from-background');
    content = content.replace(/to-\[\#e9ecef\]/g, 'to-surface');
    content = content.replace(/from-\[\#f8f9fa\]/g, 'from-background');
    content = content.replace(/to-\[\#f1f3f5\]/g, 'to-surface');
    fs.writeFileSync(file, content);
  }
});
console.log('Replaced successfully');
