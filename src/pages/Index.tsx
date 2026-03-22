import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { AppLayout } from '@/components/AppLayout';
import { URLInput } from '@/components/URLInput';
import { PlatformBadges } from '@/components/PlatformBadges';
import { RecentVideos } from '@/components/RecentVideos';
import { CutSelector } from '@/components/CutSelector';
import { CaptionEditor } from '@/components/CaptionEditor';
import { ProgressOverlay } from '@/components/ProgressOverlay';

function DashboardView() {
  return (
    <div className="text-center">
      {/* Hero */}
      <motion.h1
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-4 text-balance"
      >
        Crie Reels que{' '}
        <span className="gradient-text">viralizam</span>
        <br />
        em segundos
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 text-pretty"
      >
        Corte automaticamente os melhores momentos. Legendas perfeitas. Formato otimizado. Zero esforço.
      </motion.p>

      <URLInput />
      <PlatformBadges />
      <RecentVideos />
    </div>
  );
}

const Index = () => {
  const { currentStep } = useAppStore();

  return (
    <AppLayout>
      <ProgressOverlay />
      <AnimatePresence mode="wait">
        {currentStep === 'idle' && (
          <motion.div key="dashboard" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <DashboardView />
          </motion.div>
        )}
        {currentStep === 'selecting' && (
          <motion.div key="selecting" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <CutSelector />
          </motion.div>
        )}
        {currentStep === 'editing' && (
          <motion.div key="editing" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <CaptionEditor />
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Index;
