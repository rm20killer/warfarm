import React from 'react';
import { ItemGeneralInfo } from '../../../shared/data/item-database';
import { ResourceFarmingGuide } from '../../../shared/data/resource-guide';
import { detailStyles as styles } from './itemDetailStyles';

interface ItemGeneralInfoAsideViewProps {
  itemGeneralInfo?: ItemGeneralInfo;
  personalNote: string;
  noteSaved: boolean;
  resourceGuide?: ResourceFarmingGuide;
  onChangeNote: (note: string) => void;
  onSaveNote: () => void;
}

export function ItemGeneralInfoAsideView({
  itemGeneralInfo,
  personalNote,
  noteSaved,
  resourceGuide,
  onChangeNote,
  onSaveNote,
}: ItemGeneralInfoAsideViewProps) {
  return (
    <>
      {itemGeneralInfo && (
        <section style={styles.sectionCard}>
          <h3 style={styles.sectionSubTitle}>General Information</h3>
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Type</span>
              <span style={styles.infoVal}>{itemGeneralInfo.type}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mastery Requirement</span>
              <span style={{ ...styles.infoVal, color: '#8ec4c4', fontWeight: 600 }}>
                Rank {itemGeneralInfo.masteryReq}
              </span>
            </div>
            {itemGeneralInfo.polarity && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Polarity</span>
                <span style={styles.infoVal}>{itemGeneralInfo.polarity}</span>
              </div>
            )}
            {itemGeneralInfo.trigger && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Trigger</span>
                <span style={styles.infoVal}>{itemGeneralInfo.trigger}</span>
              </div>
            )}
            {itemGeneralInfo.ammoType && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Ammo Type</span>
                <span style={styles.infoVal}>{itemGeneralInfo.ammoType}</span>
              </div>
            )}
            {itemGeneralInfo.rivenDisposition && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Riven Disposition</span>
                <span style={styles.infoVal}>{itemGeneralInfo.rivenDisposition}</span>
              </div>
            )}
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Introduced</span>
              <span style={styles.infoVal}>{itemGeneralInfo.introduced}</span>
            </div>
            {itemGeneralInfo.vendorSources && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Vendor / Acquisition</span>
                <span style={{ ...styles.infoVal, color: '#d8c474' }}>
                  {itemGeneralInfo.vendorSources}
                </span>
              </div>
            )}
            {itemGeneralInfo.officialDropSourceUrl && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Official Drop Tables</span>
                <a
                  href={itemGeneralInfo.officialDropSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.dropTablesLink}
                >
                  Official Drop Tables &#8599;
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <section style={styles.sectionCard}>
        <h2 style={styles.sectionTitle}>Personal Notes</h2>
        <p style={styles.notesHelp}>
          Private notes for this item. Saved locally in your browser.
        </p>
        <textarea
          rows={5}
          placeholder="Write notes (e.g. Radshare squad recruited, need 2 more argon crystals before 00:00 UTC)..."
          value={personalNote}
          onChange={(e) => onChangeNote(e.target.value)}
          onBlur={onSaveNote}
          style={styles.notesTextarea}
        />
        <div style={styles.notesActions}>
          <button type="button" onClick={onSaveNote} style={styles.saveNoteBtn}>
            {noteSaved ? 'Saved!' : 'Save Note'}
          </button>
        </div>
      </section>

      {resourceGuide && (
        <section style={styles.sectionCard}>
          <h3 style={styles.sectionSubTitle}>Planetary Availability</h3>
          <ul style={styles.planetList}>
            {resourceGuide.planets.map((planet) => (
              <li key={planet} style={styles.planetItem}>
                &#8226; {planet}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

