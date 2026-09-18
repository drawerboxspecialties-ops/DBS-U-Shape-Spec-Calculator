import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFraction, fmt, toDecimalInput } from '../js/utils.js';

test('parseFraction: plain decimals and integers', () => {
    assert.equal(parseFraction('20'), 20);
    assert.equal(parseFraction('19.5'), 19.5);
    assert.equal(parseFraction('0.188'), 0.188);
    assert.equal(parseFraction('  12  '), 12);
});

test('parseFraction: mixed numbers with space', () => {
    assert.equal(parseFraction('19 1/2'), 19.5);
    assert.equal(parseFraction('10 3/8'), 10.375);
    assert.equal(parseFraction('0 1/2'), 0.5);
    assert.equal(parseFraction('19  1/2'), 19.5);
});

test('parseFraction: hyphen mixed numbers and simple fractions', () => {
    assert.equal(parseFraction('5-1/2'), 5.5);
    assert.equal(parseFraction('1/2'), 0.5);
    assert.equal(parseFraction('3/4'), 0.75);
});

test('parseFraction: spaces around slash and inch marks', () => {
    assert.equal(parseFraction('19 1 / 2'), 19.5);
    assert.equal(parseFraction('1 / 2'), 0.5);
    assert.equal(parseFraction('19 1/2"'), 19.5);
    assert.equal(parseFraction('19-1/2"'), 19.5);
});

test('parseFraction: invalid / empty → NaN', () => {
    assert.ok(Number.isNaN(parseFraction('')));
    assert.ok(Number.isNaN(parseFraction('   ')));
    assert.ok(Number.isNaN(parseFraction('abc')));
    assert.ok(Number.isNaN(parseFraction(null)));
});

test('toDecimalInput converts fractions to decimal strings', () => {
    assert.equal(toDecimalInput('19 1/2'), '19.5');
    assert.equal(toDecimalInput('1/2'), '0.5');
    assert.equal(toDecimalInput('5-1/2'), '5.5');
    assert.equal(toDecimalInput('20'), '20');
    assert.equal(toDecimalInput(''), null);
    assert.equal(toDecimalInput('nope'), null);
});

test('fmt still rounds to 3 decimals', () => {
    assert.equal(fmt(12.4375), '12.438');
    assert.equal(fmt(19.5), '19.5');
});
