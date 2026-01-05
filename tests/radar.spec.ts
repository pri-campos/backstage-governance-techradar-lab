import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

interface RadarQuadrant {
  id: string;
  name: string;
}

interface RadarTimelineItem {
  ringId: string;
  date: string;
}

interface RadarEntry {
  id: string;
  key?: string;
  title: string;
  quadrant: string;
  description: string;
  timeline: RadarTimelineItem[];
}

interface TechRadar {
  quadrants: RadarQuadrant[];
  entries: RadarEntry[];
}

const radarPath = path.resolve(process.cwd(), 'platform-tech-radar.json');
const raw = fs.readFileSync(radarPath, 'utf-8');
const radar: TechRadar = JSON.parse(raw);

const ALLOWED_QUADRANTS = ['infrastructure', 'frameworks', 'languages', 'process'] as const;

type AllowedQuadrant = (typeof ALLOWED_QUADRANTS)[number];

describe('Tech Radar JSON – Structural validation', () => {
  it('should declare exactly 4 quadrants and only the allowed set', () => {
    const ids = radar.quadrants.map((q) => q.id);

    expect(ids).to.have.length(4);
    expect(new Set(ids).size).to.equal(4);

    expect(ids).to.have.members(ALLOWED_QUADRANTS);
    expect(ids).to.have.length(ALLOWED_QUADRANTS.length);
  });

  it('should have entries array', () => {
    expect(radar.entries).to.be.an('array').that.is.not.empty;
  });

  describe('Entries', () => {
    const ids = new Set<string>();
    const keys = new Set<string>();

    radar.entries.forEach((entry: RadarEntry, index: number) => {
      describe(`entry[${index}] – ${entry.id}`, () => {
        it('should have required fields', () => {
          expect(entry).to.have.property('id').that.is.a('string');
          expect(entry).to.have.property('title').that.is.a('string');
          expect(entry).to.have.property('quadrant').that.is.a('string');
          expect(entry).to.have.property('description').that.is.a('string');
          expect(entry).to.have.property('timeline').that.is.an('array');
        });

        it('should not have duplicated id', () => {
          expect(ids.has(entry.id)).to.be.false;
          ids.add(entry.id);
        });

        it('should not have duplicated key (if present)', () => {
          if (entry.key) {
            expect(keys.has(entry.key)).to.be.false;
            keys.add(entry.key);
          }
        });

        it('should use a valid quadrant', () => {
          expect(ALLOWED_QUADRANTS).to.include(entry.quadrant as AllowedQuadrant);
        });

        it('should have a valid timeline', () => {
          expect(entry.timeline).to.be.an('array').that.is.not.empty;

          entry.timeline.forEach((item: RadarTimelineItem, tIndex: number) => {
            expect(item, `timeline[${tIndex}]`).to.have.property('ringId').that.is.a('string');
            expect(item, `timeline[${tIndex}]`).to.have.property('date').that.is.a('string');
          });
        });
      });
    });
  });
});
