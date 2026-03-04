import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { setActiveView, openProject } from "../redux/viewSlice";
import { X, Folder, CheckSquare } from "lucide-react";
import { setSearchQuery } from "../redux/searchSlice";

const SearchResults: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const dispatch = useDispatch();
    const searchQuery = useSelector((state: RootState) => state.searchStore.query);
    const projects = useSelector((state: RootState) => state.projectStore.projects);
    const tasks = useSelector((state: RootState) => state.taskStore.tasks);

    const filteredProjects = useMemo(() => {
        if (!searchQuery) return [];
        return projects.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    const filteredTasks = useMemo(() => {
        if (!searchQuery) return [];
        return tasks.filter((t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, searchQuery]);

    if (!searchQuery) return null;

    return (
        <div className="bg-white text-[#0F172A] p-6 rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-w-6xl w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Search Results</h2>
                <button
                    onClick={() => {
                        dispatch(setSearchQuery(""));
                        if (onClose) onClose();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full text-[#64748B] transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <p className="text-sm font-medium text-[#64748B] mb-4">
                Showing results for "<span className="text-[#0F172A]">{searchQuery}</span>"
            </p>

            {/* Projects */}
            <div className="mb-6">
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Folder size={14} /> Projects ({filteredProjects.length})
                </h3>
                {filteredProjects.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">No projects found.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredProjects.map((p) => (
                            <div
                                key={p._id}
                                onClick={() => {
                                    dispatch(openProject(p._id));
                                    dispatch(setSearchQuery(""));
                                }}
                                className="p-3 bg-white border border-[#E5E7EB] rounded-lg shadow-sm cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
                            >
                                <div className="font-semibold text-[#0F172A] group-hover:text-purple-600 transition-colors">
                                    {p.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tasks */}
            <div>
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckSquare size={14} /> Tasks ({filteredTasks.length})
                </h3>
                {filteredTasks.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">No tasks found.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredTasks.map((t) => (
                            <div
                                key={t._id}
                                onClick={() => {
                                    dispatch(setActiveView("tasks"));
                                    dispatch(setSearchQuery(""));
                                }}
                                className="p-3 bg-white border border-[#E5E7EB] rounded-lg shadow-sm cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
                            >
                                <div className="font-semibold text-[#0F172A] group-hover:text-purple-600 transition-colors">
                                    {t.title}
                                </div>
                                {t.description && (
                                    <div className="text-xs text-[#64748B] mt-1 line-clamp-1">
                                        {t.description}
                                    </div>
                                )}
                                <div className="mt-2 flex gap-2">
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${t.status === "done"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : t.status === "in-progress"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        {t.status}
                                    </span>
                                    {t.priority && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 uppercase border border-purple-100">
                                            {t.priority}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
