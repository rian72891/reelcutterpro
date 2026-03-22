import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Library, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Library, label: 'Biblioteca', path: '/library' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-active"
                  className="absolute -top-0.5 w-8 h-0.5 gradient-primary rounded-full"
                />
              )}
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
