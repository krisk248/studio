"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50, {
    message: "Name must not exceed 50 characters."
  }),
})

export function StartQuizForm() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(`/quiz?name=${encodeURIComponent(values.name)}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Enter Your Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., Jane Doe" 
                  {...field} 
                  className="py-6 text-md focus:ring-2 focus:ring-primary" 
                  aria-label="Your Name"
                />
              </FormControl>
              <FormDescription>
                Your name will be used to record your quiz results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full py-6 text-lg">
          Start Quiz <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </Form>
  )
}
