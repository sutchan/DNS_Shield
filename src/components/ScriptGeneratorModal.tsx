// src/components/ScriptGeneratorModal.tsx v3.9.12
// 路由器与 DNS 守护进程同步脚本生成弹窗
'use client';
import * as React from 'react';
import { X, Terminal, Copy, Check } from 'lucide-react';
import { useT } from '../context/AppContext';
import { Button } from './ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { copyToClipboard } from '../utils/fileUtils';
import { generateRouterScript, RouterScriptTarget } from '../utils/scriptGenerator';

interface ScriptGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  showToast: (key: string) => void;
}

export const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = ({ open, onClose, showToast }) => {
  const t = useT();
  const [mounted, setMounted] = React.useState(open);
  const [target, setTarget] = React.useState<RouterScriptTarget>('openwrt');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const scriptContent = React.useMemo(() => {
    return generateRouterScript({
      ruleUrl: 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/dnsmasq.conf',
      target,
    });
  }, [target]);

  const handleCopy = async () => {
    const success = await copyToClipboard(scriptContent);
    if (success) {
      setCopied(true);
      showToast('routerScriptCopied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`guide-modal-overlay ${open ? 'open' : 'closing'}`}
      id="scriptGeneratorModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="script-generator-modal-title"
      onClick={onClose}
    >
      <div
        className="guide-modal max-w-xl"
        id="script-generator-card"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="guide-modal-header" id="script-generator-header">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="guide-modal-title text-lg font-semibold" id="script-generator-modal-title">
              {t.routerScriptTitle}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="guide-modal-close"
            id="script-generator-close-btn"
            aria-label={t.close}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="guide-modal-body space-y-4 pt-2" id="script-generator-body">
          <p className="text-sm text-muted-foreground">{t.routerScriptDesc}</p>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium shrink-0">{t.routerScriptTargetLabel}:</span>
            <Select value={target} onValueChange={(v) => setTarget(v as RouterScriptTarget)}>
              <SelectTrigger className="w-[180px]" id="script-target-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openwrt">OpenWrt / iStoreOS</SelectItem>
                <SelectItem value="merlin">AsusWRT-Merlin</SelectItem>
                <SelectItem value="padavan">Padavan</SelectItem>
                <SelectItem value="smartdns">SmartDNS</SelectItem>
                <SelectItem value="pihole">Pi-hole</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <pre className="p-3 bg-muted/70 border border-border rounded-xl text-xs font-mono overflow-x-auto max-h-60 leading-relaxed select-all">
              {scriptContent}
            </pre>
          </div>
        </div>

        <div className="guide-modal-footer flex items-center justify-between mt-4" id="script-generator-footer">
          <Button
            type="button"
            variant="default"
            onClick={handleCopy}
            id="copy-script-btn"
            className="font-semibold shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-success" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                {t.routerScriptCopyBtn}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} id="script-generator-close-footer-btn">
            {t.close}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScriptGeneratorModal;
