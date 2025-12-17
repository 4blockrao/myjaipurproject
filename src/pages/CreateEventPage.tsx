import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NativeBottomNav from "@/components/home/NativeBottomNav";
import CreateEventForm from "@/components/events/CreateEventForm";

const CreateEventPage = () => {
  return (
    <>
      <Helmet>
        <title>Create Event | Jaipur Circle</title>
        <meta
          name="description"
          content="Create and host your event in Jaipur. Reach thousands of people in the city."
        />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link to="/events">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Create Event</h1>
              <p className="text-xs text-muted-foreground">Host your event in Jaipur</p>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 max-w-2xl mx-auto">
          <CreateEventForm />
        </main>

        <NativeBottomNav />
      </div>
    </>
  );
};

export default CreateEventPage;
