// src/components/GuideModal.tsx v3.15.0
// 使用指南独立弹窗（对齐原型 #guide-modal52：页脚 linkGuide 触发）
'use client';
import * as React from 'react';
import { X } from 'lucide-react';
import { useT } from '../context/AppContext';
import { Button } from './ui/Button';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { useModalEscape } from '../hooks/useModalEscape';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ open, onClose }) => {
  const t = useT();
  const [mounted, setMounted] = React.useState(open);

  // 关闭后延迟卸载以播放退出动画
  React.useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [open]);

  // 滚动锁：引用计数实现，与其他弹窗叠放时互不破坏（T-P1-17）
  React.useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  // ESC 关闭：仅栈顶弹窗响应，避免叠放弹窗被一次按键全关（T-P1-16）
  useModalEscape(open, onClose);

  if (!mounted) return null;

  const steps = [
    { t: t.gStep1t, d: t.gStep1d },
    { t: t.gStep2t, d: t.gStep2d },
    { t: t.gStep3t, d: t.gStep3d },
  ];

  return (
    <div
      className={`guide-modal-overlay ${open ? 'open' : 'closing'}`}
      id="guide-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      onClick={onClose}
    >
      <div className="guide-modal" id="guide-modal-card" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="guide-modal-header" id="guide-modal-header">
          <h2 className="guide-modal-title" id="guide-modal-title">{t.guideTitle}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t.close ?? '关闭'}
            title={t.close ?? '关闭'}
            id="guide-modal-close"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>

        <ol className="guide-steps" id="guide-steps">
          {steps.map((s, i) => (
            <li className="guide-step" id={`guide-step-${i + 1}`} key={i}>
              <span className="guide-step-badge" aria-hidden="true">{i + 1}</span>
              <div className="guide-step-body">
                <p className="guide-step-title">{s.t}</p>
                <p className="guide-step-desc">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="guide-note" id="guide-note" role="note">
          <p className="guide-note-title">{t.guideNoteTitle}</p>
          <ul className="guide-note-list" id="guide-note-list">
            <li className="guide-note-item" id="guide-note-dnsmasq">
              <span className="guide-note-name">{t.dnsmasqFormat}</span>
              <span className="guide-note-desc">{t.deployDnsmasq}</span>
            </li>
            <li className="guide-note-item" id="guide-note-hosts">
              <span className="guide-note-name">{t.hostsFormat}</span>
              <span className="guide-note-desc">{t.deployHosts}</span>
            </li>
            <li className="guide-note-item" id="guide-note-adguard">
              <span className="guide-note-name">{t.adguardFormat} / {t.piholeFormat}</span>
              <span className="guide-note-desc">{t.deployAdguardPihole}</span>
            </li>
            <li className="guide-note-item" id="guide-note-unbound">
              <span className="guide-note-name">{t.unboundFormat} / Bind RPZ / {t.smartdnsFormat}</span>
              <span className="guide-note-desc">{t.deployUnboundBindSmartdns}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
