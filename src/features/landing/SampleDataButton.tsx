import { Button } from "@/components/ui/button";
import { strings } from "@/constants/strings";

interface Props {
  loading: boolean;
  error: boolean;
  onClick: () => void;
}

export function SampleDataButton({ loading, error, onClick }: Props) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-muted-foreground">{strings.sample.prompt}</p>
      <Button variant="outline" onClick={onClick} disabled={loading}>
        {loading ? strings.sample.loading : strings.sample.button}
      </Button>
      {error && <p role="alert" className="text-sm text-destructive">{strings.sample.error}</p>}
    </div>
  );
}
