import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { NoteEditor } from "./components/NoteEditor";
import { NotesList } from "./components/NotesList";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type View = "dashboard" | "editor" | "list";

// Sample data for demonstration
const sampleNotes: Note[] = [
  {
    id: "1",
    title: "Project Planning Ideas",
    content: "Brainstorming session for the new mobile app project. Key features to include: user authentication, real-time sync, offline mode, and push notifications. Need to research React Native vs Flutter for cross-platform development.",
    category: "Projects",
    tags: ["mobile", "planning", "brainstorm"],
    createdAt: new Date(2024, 8, 1),
    updatedAt: new Date(2024, 8, 15),
  },
  {
    id: "2",
    title: "Learning React Hooks",
    content: "Notes from React Hooks tutorial. useState manages local state, useEffect handles side effects and lifecycle. Custom hooks allow reusing stateful logic between components. Need to practice with useContext and useReducer next.",
    category: "Learning",
    tags: ["react", "javascript", "frontend"],
    createdAt: new Date(2024, 8, 10),
    updatedAt: new Date(2024, 8, 20),
  },
  {
    id: "3",
    title: "Weekly Meeting Notes",
    content: "Team standup meeting notes. Discussed progress on current sprint, identified blockers, and planned next week's priorities. John needs help with the API integration, Sarah finished the UI components ahead of schedule.",
    category: "Work",
    tags: ["meeting", "team", "standup"],
    createdAt: new Date(2024, 8, 18),
    updatedAt: new Date(2024, 8, 18),
  },
  {
    id: "4",
    title: "Book Ideas",
    content: "Random ideas for a potential sci-fi novel. Story about AI consciousness in a world where humans upload their minds to digital realms. Themes: identity, reality vs simulation, human connection in digital age.",
    category: "Ideas",
    tags: ["writing", "sci-fi", "creative"],
    createdAt: new Date(2024, 7, 25),
    updatedAt: new Date(2024, 8, 12),
  },
  {
    id: "5",
    title: "Healthy Recipes to Try",
    content: "Collection of healthy meal prep recipes. Mediterranean quinoa bowl with roasted vegetables, overnight oats with berries and nuts, grilled chicken with sweet potato and broccoli. All recipes should be prep-friendly for busy weekdays.",
    category: "Personal",
    tags: ["cooking", "health", "meal-prep"],
    createdAt: new Date(2024, 8, 5),
    updatedAt: new Date(2024, 8, 14),
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  // Load sample data on first render
  useEffect(() => {
    const savedNotes = localStorage.getItem("brain-hub-notes");
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    } else {
      setNotes(sampleNotes);
      localStorage.setItem("brain-hub-notes", JSON.stringify(sampleNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("brain-hub-notes", JSON.stringify(notes));
    }
  }, [notes]);

  const handleCreateNote = () => {
    setEditingNote(undefined);
    setCurrentView("editor");
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setCurrentView("editor");
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData, updatedAt: new Date() }
          : note
      ));
      toast.success("Note updated successfully!");
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes(prev => [newNote, ...prev]);
      toast.success("Note created successfully!");
    }
    setCurrentView("dashboard");
    setEditingNote(undefined);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success("Note deleted successfully!");
  };

  const handleSelectNote = (note: Note) => {
    handleEditNote(note);
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setEditingNote(undefined);
    setSearchQuery("");
  };

  const handleViewAllNotes = () => {
    setCurrentView("list");
  };

  const categories = Array.from(new Set(notes.map(note => note.category)));

  const filteredNotes = searchQuery
    ? notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes;

  return (
    <div className="min-h-screen">
      {currentView === "dashboard" && (
        <>
          <Dashboard
            notes={filteredNotes}
            onCreateNote={handleCreateNote}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            onSelectNote={handleSelectNote}
          />
          {filteredNotes.length > 6 && (
            <div className="fixed bottom-6 right-6">
              <button
                onClick={handleViewAllNotes}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full shadow-lg transition-all hover:shadow-xl"
              >
                View All Notes ({notes.length})
              </button>
            </div>
          )}
        </>
      )}

      {currentView === "editor" && (
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onBack={handleBackToDashboard}
          categories={categories}
        />
      )}

      {currentView === "list" && (
        <NotesList
          notes={notes}
          onBack={handleBackToDashboard}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      <Toaster />
    </div>
  );
}