// src/pages/Project.jsx
import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import AssetIngester from "../components/AssetIngester.jsx";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Plus,
  X,
  Layers,
  Image,
  Video,
  FileText,
  Music,
} from "lucide-react";
import { PROJECT } from "../graphql/queries";
import {
  UPDATE_PROJECT,
  DELETE_PROJECT,
  DELETE_ASSET,
} from "../graphql/mutations";
import { MY_PROJECTS } from "../graphql/queries";

const getAssetIcon = (mimeType) => {
  if (!mimeType) return Layers;
  if (mimeType.startsWith("image")) return Image;
  if (mimeType.startsWith("video")) return Video;
  if (mimeType.startsWith("audio")) return Music;
  return FileText;
};

const AssetCard = ({ asset, onDelete }) => {
  const Icon = getAssetIcon(asset.mimeType);

  return (
    <div className="group border border-[#111111] bg-white flex flex-col h-48">
      <div className="flex-1 border-b border-[#111111] flex items-center justify-center bg-[#F9F9F9] relative overflow-hidden">
        {asset.thumbnailUrl || (asset.url && asset.mimeType?.startsWith('image/')) ? (
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          // eslint-disable-next-line react-hooks/static-components
          <Icon className="text-[#111111] opacity-20" size={36} />
        )}

        <button
          onClick={() => onDelete(asset.id)}
          className="absolute top-2 right-2 p-1.5 bg-white border border-[#111111] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF4500] hover:text-white hover:border-[#FF4500]"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="p-3">
        <p className="font-mono text-xs text-[#111111] truncate">
          {asset.filename}
        </p>
        <p className="font-mono text-[10px] text-[#111111]/50 uppercase mt-1">
          {asset.mimeType}
        </p>
      </div>
    </div>
  );
};

const EditModal = ({ isOpen, onClose, project }) => {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [tags, setTags] = useState(project?.tags?.join(", ") || "");

  const [updateProject, { loading }] = useMutation(UPDATE_PROJECT);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const input = {
        name,
        description,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await updateProject({ variables: { id: project.id, input } });
      onClose();
    } catch (err) {
      console.error("Update failed:", err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-md border border-[#111111] bg-white p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#111111] uppercase">
            Edit_Capsule
          </h2>
          <button
            onClick={onClose}
            className="text-[#111111] hover:text-[#FF4500]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs uppercase text-[#111111] mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#111111] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#111111] mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
              placeholder="design, summer, client-a"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#111111] font-bold uppercase text-sm hover:bg-[#F9F9F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#FF4500] text-white font-bold uppercase text-sm border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#111111] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showIngest, setShowIngest] = useState(false);

  const { data, loading, error, refetch } = useQuery(PROJECT, {
    variables: { id },
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    refetchQueries: [{ query: MY_PROJECTS }],
    onCompleted: () => navigate("/"),
  });

  const [deleteAsset] = useMutation(DELETE_ASSET, {
    refetchQueries: [{ query: PROJECT, variables: { id } }],
  });

  const handleDelete = async () => {
    if (!window.confirm("Delete this capsule? This action cannot be undone."))
      return;
    try {
      await deleteProject({ variables: { id } });
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Remove this asset?")) return;
    try {
      await deleteAsset({ variables: { id: assetId } });
    } catch (err) {
      console.error("Delete asset failed:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <p className="font-mono text-sm text-[#111111]/60">
          Loading capsule...
        </p>
      </div>
    );
  }

  if (error || !data?.project) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-[#FF4500] mb-4">
            {error ? error.message : "Capsule not found"}
          </p>
          <Link
            to="/"
            className="font-mono text-xs text-[#111111] hover:text-[#FF4500] transition-colors"
          >
            ← BACK TO CAPSULES
          </Link>
        </div>
      </div>
    );
  }

  const project = data.project;
  const assets = project.assets || [];

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <header className="h-20 border-b border-[#111111] px-6 lg:px-12 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-[#111111] hover:text-[#FF4500] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="font-mono text-xs text-[#111111]/60">
              <span className="text-[#FF4500]">SYSTEM</span> // CAPSULES //{" "}
              {project.slug}
            </div>
            <h1 className="text-xl font-bold text-[#111111] uppercase">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#111111] font-mono text-xs uppercase hover:bg-[#111111] hover:text-white transition-colors"
          >
            <Edit3 size={14} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-[#FF4500] text-[#FF4500] font-mono text-xs uppercase hover:bg-[#FF4500] hover:text-white transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </header>

      {/* Project Info */}
      <div className="px-6 lg:px-12 py-8 border-b border-[#111111] bg-white">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="font-mono text-xs text-[#111111]/60 uppercase mb-1">
              Status
            </p>
            <span className="font-mono text-sm text-[#111111] uppercase">
              {project.status}
            </span>
          </div>
          <div>
            <p className="font-mono text-xs text-[#111111]/60 uppercase mb-1">
              Assets
            </p>
            <span className="font-mono text-sm text-[#111111]">
              {project.assetCount || 0}
            </span>
          </div>
          {project.tags?.length > 0 && (
            <div>
              <p className="font-mono text-xs text-[#111111]/60 uppercase mb-1">
                Tags
              </p>
              <div className="flex gap-2 flex-wrap">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs border border-[#111111] px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {project.description && (
          <p className="mt-4 font-mono text-sm text-[#111111]/70">
            {project.description}
          </p>
        )}
      </div>

      {/* Assets */}
      <div className="px-6 lg:px-12 py-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#111111] uppercase tracking-tight">
            Assets
          </h2>
          <button
            onClick={() => setShowIngest(true)}
            className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 font-bold text-sm uppercase border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#111111] transition-colors"
          >
            <Plus size={16} />
            Ingest
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="border border-dashed border-[#111111]/30 p-12 flex flex-col items-center justify-center">
            <Layers className="text-[#111111] opacity-20 mb-4" size={48} />
            <p className="font-mono text-sm text-[#111111]/60">
              No assets ingested yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={handleDeleteAsset}
              />
            ))}
          </div>
        )}
      </div>

      <EditModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        project={project}
      />

      <AssetIngester
        isOpen={showIngest}
        onClose={() => setShowIngest(false)}
        activeCapsuleId={id}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
