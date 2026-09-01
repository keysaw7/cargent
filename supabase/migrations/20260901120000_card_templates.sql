-- Visual card templates, independent from card_kind.

create type public.card_template as enum (
  'classique',
  'signal',
  'reflet',
  'grimoire',
  'terminal',
  'arcane',
  'obsidienne',
  'classeur',
  'relique'
);

alter table public.cards
  add column template public.card_template not null default 'classique';
