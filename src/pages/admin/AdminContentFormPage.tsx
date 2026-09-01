import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import type { WatermarkSettings } from '../../types';
import './AdminContentFormPage.css';

const emptyWatermark: WatermarkSettings = {
  enabled: true,
  text: 'STREAM UG',
  opacity: 0.5,
  position: 'bottom-right',
};

/** Admin form to add new content, or edit existing content, including watermark settings. */
export function AdminContentFormPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { contents, categories, contentTypes, addContent, updateContent } = useAppState();

  const existing = contentId ? contents.find((c) => c.id === contentId) : undefined;
  const isEditing = Boolean(existing);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [contentTypeId, setContentTypeId] = useState(existing?.contentTypeId ?? contentTypes[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? '');
  const [trailerUrl, setTrailerUrl] = useState(existing?.trailerUrl ?? '');
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? '');
  const [posterUrl, setPosterUrl] = useState(existing?.posterUrl ?? '');
  const [durationMinutes, setDurationMinutes] = useState(existing?.durationMinutes ?? 0);
  const [releaseYear, setReleaseYear] = useState(existing?.releaseYear ?? new Date().getFullYear());
  const [watermark, setWatermark] = useState<WatermarkSettings>(existing?.watermark ?? emptyWatermark);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const watermarkSettings = watermark;

    if (isEditing && existing) {
      updateContent({
        ...existing,
        title,
        description,
        contentTypeId,
        categoryId,
        trailerUrl,
        videoUrl,
        posterUrl: posterUrl || 'https://picsum.photos/seed/new-content/400/560',
        durationMinutes,
        releaseYear,
        watermark: watermarkSettings,
        updatedAt: now,
      });
    } else {
      addContent({
        title,
        description,
        contentTypeId,
        categoryId,
        trailerUrl,
        videoUrl,
        posterUrl: posterUrl || 'https://picsum.photos/seed/new-content/400/560',
        durationMinutes,
        releaseYear,
        watermark: watermarkSettings,
      });
    }
    navigate('/admin/content');
  };

  return (
    <div>
      <h1>{isEditing ? 'Edit Content' : 'Upload Content'}</h1>
      <form onSubmit={handleSubmit} className="admin-content-form">
        <label>
          Movie Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Content Type
          <select value={contentTypeId} onChange={(e) => setContentTypeId(e.target.value)}>
            {contentTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Movie Trailer URL
          <input value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} placeholder="https://..." required />
        </label>
        <label>
          Full Movie Video URL
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." required />
        </label>
        <label>
          Poster Image URL
          <input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://..." />
        </label>
        <div className="admin-content-form__row">
          <label>
            Duration (minutes)
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={0}
            />
          </label>
          <label>
            Release Year
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(Number(e.target.value))}
            />
          </label>
        </div>

        <fieldset className="admin-content-form__watermark">
          <legend>Watermark Settings</legend>
          <label className="admin-content-form__checkbox">
            <input
              type="checkbox"
              checked={watermark.enabled}
              onChange={(e) => setWatermark({ ...watermark, enabled: e.target.checked })}
            />
            Enable watermark
          </label>
          <label>
            Watermark Text
            <input
              value={watermark.text}
              onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
            />
          </label>
          <label>
            Opacity
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={watermark.opacity}
              onChange={(e) => setWatermark({ ...watermark, opacity: Number(e.target.value) })}
            />
          </label>
          <label>
            Position
            <select
              value={watermark.position}
              onChange={(e) =>
                setWatermark({ ...watermark, position: e.target.value as WatermarkSettings['position'] })
              }
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="center">Center</option>
            </select>
          </label>
        </fieldset>

        <button type="submit">{isEditing ? 'Save Changes' : 'Upload Content'}</button>
      </form>
    </div>
  );
}
