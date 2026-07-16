import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConstructionIcon } from "lucide-react";

export function UnderDevelopment({ bureau }: { bureau: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ConstructionIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="mt-2 text-xl">{bureau}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page is currently under development. Please try again later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
