import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CommandPalette from './CommandPalette.jsx';

export default function Layout() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, position: 'relative' }}>
        {/* Keyed on the path so each route change remounts and plays the
            fade-in. We intentionally do NOT use <AnimatePresence mode="wait">
            here: that waits for the OUTGOING page's exit animation before
            mounting the new one, and framer occasionally fails to fire the
            new page's enter animation — leaving it mounted but at opacity:0
            (a blank page that only a hard refresh fixed). Without the exit
            choreography the incoming page always mounts and animates in. */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <CommandPalette />
    </>
  );
}
