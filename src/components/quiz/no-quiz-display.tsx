import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function NoQuizDisplay() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
          <CardTitle className="text-2xl">No Quiz Today</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            It seems there's no quiz data available at the moment. Please check back later or contact the administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
