// src/app/Home.test.tsx v2.0.0
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Home Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.clear();
  });

  test('renders DNS Shield header', () => {
    render(<Home />);
    expect(screen.getByText('🛡️ DNS Shield')).toBeInTheDocument();
  });

  test('renders input and output panels', () => {
    render(<Home />);
    expect(screen.getByText('📥 输入域名清单')).toBeInTheDocument();
    expect(screen.getByText('📤 生成过滤规则')).toBeInTheDocument();
  });

  test('renders format tabs', () => {
    render(<Home />);
    expect(screen.getByText('Hosts')).toBeInTheDocument();
    expect(screen.getByText('Dnsmasq')).toBeInTheDocument();
    expect(screen.getByText('AdGuard 格式')).toBeInTheDocument();
  });

  test('switches language', () => {
    render(<Home />);
    const langSwitch = screen.getByText('中');
    fireEvent.click(langSwitch);
    expect(screen.getByText('Input Domain List')).toBeInTheDocument();
  });

  test('switches theme', () => {
    render(<Home />);
    const themeBtn = screen.getByTitle('切换主题');
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('generates rules', () => {
    render(<Home />);
    const sourceInput = screen.getByRole('textbox');
    fireEvent.change(sourceInput, { target: { value: 'ad.example.com' } });
    
    const generateBtn = screen.getByText('🔄 生成规则');
    fireEvent.click(generateBtn);
    
    const outputPreview = screen.getByText('// 生成的规则将显示在这里');
    expect(outputPreview).toBeInTheDocument();
  });

  test('fetches domains from URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('ad.example.com\nads.example.com'),
    } as Response);

    render(<Home />);
    const urlInput = screen.getByPlaceholderText('输入 URL 导入域名列表...');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/domains.txt' } });
    
    const fetchBtn = screen.getByText('获取');
    fireEvent.click(fetchBtn);
    
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/domains.txt');
  });

  test('loads preset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('ad.example.com'),
    } as Response);

    render(<Home />);
    const adguardPreset = screen.getByText('AdGuard');
    fireEvent.click(adguardPreset);
    
    expect(mockFetch).toHaveBeenCalledWith('https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt');
  });

  test('sorts domains', () => {
    render(<Home />);
    const sourceInput = screen.getByRole('textbox');
    fireEvent.change(sourceInput, { target: { value: 'z.example.com\na.example.com' } });
    
    const sortBtn = screen.getByText('↕️ 排序');
    fireEvent.click(sortBtn);
    
    expect(sourceInput).toHaveValue('a.example.com\nz.example.com');
  });
  
  test('dedupes domains', () => {
    render(<Home />);
    const sourceInput = screen.getByRole('textbox');
    fireEvent.change(sourceInput, { target: { value: 'ad.example.com\nad.example.com' } });
    
    const dedupeBtn = screen.getByText('🔄 去重');
    fireEvent.click(dedupeBtn);
    
    expect(sourceInput).toHaveValue('ad.example.com');
  });
  
  test('clears input', () => {
    render(<Home />);
    const sourceInput = screen.getByRole('textbox');
    fireEvent.change(sourceInput, { target: { value: 'ad.example.com' } });
    
    const clearBtn = screen.getByText('🗑️ 清空');
    fireEvent.click(clearBtn);
    
    expect(sourceInput).toHaveValue('');
  });
});
