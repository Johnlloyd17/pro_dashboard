import { getLabels } from "@/app/actions/label-action";
import OptionTable from "@/components/option-table";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Option } from "lucide-react";
import React from "react";

export default async function SettingPage() {
  const labels = await getLabels();
  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-end">
        <div>
          <CardTitle className="text-xl">Settings</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </CardDescription>
        </div>
        <div className="flex flex-row gap-2"></div>
      </div>
      <Separator />
      <div>
        <Tabs defaultValue="account" orientation="vertical">
          <TabsList className="w-60 flex flex-col gap-2 p-2">
            <TabsTrigger value="account">
              <Option className="mr-2 h-4 w-4" />
              Select Option
            </TabsTrigger>
            <TabsTrigger value="password" className="py-8 h-12">
              Password
            </TabsTrigger>
            <TabsTrigger value="notifications" className="py-8 h-12">
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <OptionTable labels={labels} />
          </TabsContent>
          <TabsContent value="password">
            <p className="text-sm text-muted-foreground">
              Change your password at any time.
            </p>
          </TabsContent>
          <TabsContent value="notifications">
            <p className="text-sm text-muted-foreground">
              Manage your notification settings.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
