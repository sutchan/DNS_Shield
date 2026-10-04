// src/components/RuleTesterModal.tsx v3.10.0
// 域名拦截匹配独立测试弹窗：支持实时输入任意域名或 URL 进行规则匹配分析
'use client';
import * as React from 'react';
import { X, SearchCheck, CheckCircle2, ShieldAlert, Globe, HelpCircle } from 'lucide-react';
import { useT } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ParsedData } from '../types';
import { matchDomainRule, RuleMatchResult } from '../utils/ruleMatcher';

interface RuleTesterModalProps {
  open: boolean;
  onClose: () => void;
  parsedData: ParsedData;
}

export const RuleTesterModal: React.FC<RuleTesterModalProps> = ({ open, onClose, parsedData }) => {
  const t = useT();
  const [mounted, setMounted] = React.useState(open);
  const [queryInput, setQueryInput] = React.useState('');
  const [matchResult, setMatchResult] = React.useState<RuleMatchResult | null>(null);

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

  const handleTest = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!queryInput.trim()) return;
    const res = matchDomainRule(queryInput, parsedData);
    setMatchResult(res);
  };

  if (!mounted) return null;

  return (
    <div
      className={`guide-modal-overlay ${open ? 'open' : 'closing'}`}
      id="ruleTesterModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rule-tester-modal-title"
      onClick={onClose}
    >
      <div
        className="guide-modal max-w-lg"
        id="rule-tester-card"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="guide-modal-header" id="rule-tester-header">
          <div className="flex items-center gap-2">
            <SearchCheck className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="guide-modal-title text-lg font-semibold" id="rule-tester-modal-title">
              {t.ruleTesterTitle}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="guide-modal-close"
            id="rule-tester-close-btn"
            aria-label={t.close}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="guide-modal-body space-y-4 pt-2" id="rule-tester-body">
          <p className="text-sm text-muted-foreground">{t.ruleTesterDesc}</p>

          <form onSubmit={handleTest} className="flex gap-2">
            <Input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={t.ruleTesterInputPlaceholder}
              className="flex-1"
              id="rule-tester-input"
              autoFocus
            />
            <Button type="submit" variant="default" id="rule-tester-submit-btn">
              {t.ruleTesterBtn}
            </Button>
          </form>

          {matchResult && (
            <div
              className={`p-4 rounded-xl border text-sm transition-all ${
                matchResult.action === 'blocked'
                  ? 'bg-destructive/10 border-destructive/30 text-destructive-foreground'
                  : matchResult.action === 'whitelisted'
                  ? 'bg-success/10 border-success/30 text-success-foreground'
                  : matchResult.action === 'customDns'
                  ? 'bg-info/10 border-info/30 text-info-foreground'
                  : 'bg-muted/50 border-border text-foreground'
              }`}
              id="rule-tester-result-card"
            >
              <div className="flex items-start gap-3">
                {matchResult.action === 'blocked' && (
                  <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                )}
                {matchResult.action === 'whitelisted' && (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                )}
                {matchResult.action === 'customDns' && (
                  <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                )}
                {matchResult.action === 'passed' && (
                  <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                )}

                <div className="space-y-1.5 flex-1">
                  <div className="font-semibold flex items-center justify-between">
                    <span>
                      {matchResult.action === 'blocked' && t.ruleTesterActionBlocked}
                      {matchResult.action === 'whitelisted' && t.ruleTesterActionWhitelisted}
                      {matchResult.action === 'customDns' && t.ruleTesterActionCustomDns}
                      {matchResult.action === 'passed' && t.ruleTesterActionPassed}
                    </span>
                    <span className="text-xs font-mono opacity-75">{matchResult.normalizedDomain}</span>
                  </div>

                  {matchResult.matchedRule && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{t.ruleTesterMatchedRuleLabel}: </span>
                      <code className="bg-background/80 px-1.5 py-0.5 rounded border border-border font-mono">
                        {matchResult.matchedRule}
                      </code>
                    </div>
                  )}

                  {matchResult.targetIp && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{t.ruleTesterTargetIpLabel}: </span>
                      <code className="bg-background/80 px-1.5 py-0.5 rounded border border-border font-mono">
                        {matchResult.targetIp}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="guide-modal-footer mt-4" id="rule-tester-footer">
          <Button type="button" variant="outline" onClick={onClose} id="rule-tester-close-footer-btn">
            {t.close}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RuleTesterModal;
