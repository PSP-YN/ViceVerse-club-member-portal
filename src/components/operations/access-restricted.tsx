import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Shown when a signed-in user is not a Club Member. No data is queried. */
export function AccessRestricted() {
  return (
    <div className="mx-auto w-full max-w-md pt-12">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <ShieldAlert aria-hidden="true" className="size-8 text-vv-warning" />
          <h1 className="text-lg font-semibold">Club Member access required</h1>
          <p className="text-sm text-muted-foreground">
            Event Operations is available to Club Members only. If you think this is a
            mistake, ask an organiser to check your role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
