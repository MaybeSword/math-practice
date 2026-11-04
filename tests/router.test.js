import { describe, it, expect, vi } from 'vitest';
import { parseRoute, routeToHash, startRouter, ROUTES } from '../src/router.js';

describe('parseRoute', () => {
  it('reads every route', () => {
    expect(parseRoute('#/')).toBe('home');
    expect(parseRoute('')).toBe('home');
    expect(parseRoute('#')).toBe('home');
    for (const r of ['setup', 'practice', 'summary', 'mistakes', 'stats']) expect(parseRoute(`#/${r}`)).toBe(r);
  });
  it('accepts small differences', () => {
    expect(parseRoute('#/stats/')).toBe('stats');
    expect(parseRoute('#/STATS')).toBe('stats');
    expect(parseRoute('#stats')).toBe('stats');
    expect(parseRoute('#/setup?x=1')).toBe('setup');
  });
  it('unknown routes give null', () => {
    for (const h of ['#/nope', '#/home', '#/stats/extra', '#/../x']) expect(parseRoute(h)).toBeNull();
  });
  it('routeToHash is the reverse of parseRoute', () => {
    for (const r of ROUTES) expect(parseRoute(routeToHash(r))).toBe(r);
  });
});

function fakeWindow(hash) {
  const listeners = [];
  const win = {
    location: {
      hash,
      replace: vi.fn((h) => { win.location.hash = h; listeners.forEach((f) => f()); }),
    },
    addEventListener: (_, f) => listeners.push(f),
    fire: () => listeners.forEach((f) => f()),
  };
  return win;
}

describe('startRouter', () => {
  it('renders the current route on start', () => {
    const render = vi.fn();
    startRouter(render, fakeWindow('#/stats'));
    expect(render).toHaveBeenCalledWith('stats');
  });
  it('sends unknown routes to Home with replace', () => {
    const render = vi.fn();
    const win = fakeWindow('#/oops');
    startRouter(render, win);
    expect(win.location.replace).toHaveBeenCalledWith('#/');
    expect(render).toHaveBeenLastCalledWith('home');
  });
  it('navigate to the same route re-renders', () => {
    const render = vi.fn();
    const router = startRouter(render, fakeWindow('#/mistakes'));
    router.navigate('mistakes');
    expect(render).toHaveBeenCalledTimes(2);
  });
  it('navigate sets the hash (normal) or replaces it', () => {
    const win = fakeWindow('#/');
    const router = startRouter(() => {}, win);
    router.navigate('setup');
    expect(win.location.hash).toBe('#/setup');
    router.navigate('summary', { replace: true });
    expect(win.location.replace).toHaveBeenCalledWith('#/summary');
  });
});
