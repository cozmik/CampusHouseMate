import { ListingWizard } from "@/components/housemate/ListingWizard";

export default function PostListing() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Post a space</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hand over your lodge to the next student in a few quick steps.</p>
      </div>
      <ListingWizard />
    </div>
  );
}
