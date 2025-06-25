"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from "@/lib/API/axios"

const initialFormData = {
  first_name: "",
  last_name: "",
  other_name: "",
  license_number: "",
  license_details: "",
  phone_number: "",
  address: "",
  city: "",
  state: "",
  country: "",
  password: "",
  password_confirmation: "",
}

export default function DriverForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.first_name) newErrors.first_name = "First name is required"
    if (!formData.last_name) newErrors.last_name = "Last name is required"
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      const response = await api.post("/transporters/drivers", formData)
      
      if (response.data.success) {
        toast.success("Driver added successfully")
        setFormData(initialFormData) // Reset form
        onSuccess()
      } else {
        toast.error(response.data.message || "Failed to add driver")
      }
    } catch (error: any) {
      console.error("Error creating driver:", error)
      
      if (error.response?.data?.errors) {
        // Handle backend validation errors
        setErrors(error.response.data.errors)
        toast.error("Please fix the form errors")
      } else {
        toast.error(error.response?.data?.message || "Failed to add driver")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="first_name">First Name*</Label>
          <Input 
            id="first_name" 
            value={formData.first_name} 
            onChange={handleChange} 
            className={errors.first_name ? "border-red-500" : ""}
          />
          {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="last_name">Last Name*</Label>
          <Input 
            id="last_name" 
            value={formData.last_name} 
            onChange={handleChange} 
            className={errors.last_name ? "border-red-500" : ""}
          />
          {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="other_name">Other Name</Label>
          <Input id="other_name" value={formData.other_name} onChange={handleChange} />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="license_number">License Number</Label>
          <Input id="license_number" value={formData.license_number} onChange={handleChange} />
        </div>

        <div className="space-y-2 col-span-4">
          <Label htmlFor="license_details">License Details</Label>
          <Input id="license_details" value={formData.license_details} onChange={handleChange} />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="phone_number">Phone Number*</Label>
          <Input 
            id="phone_number" 
            value={formData.phone_number} 
            onChange={handleChange} 
            className={errors.phone_number ? "border-red-500" : ""}
          />
          {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={formData.address} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formData.city} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" value={formData.state} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={formData.country} onChange={handleChange} />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="password">Password*</Label>
          <Input 
            type="password" 
            id="password" 
            value={formData.password} 
            onChange={handleChange} 
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="password_confirmation">Confirm Password*</Label>
          <Input
            type="password"
            id="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={errors.password_confirmation ? "border-red-500" : ""}
          />
          {errors.password_confirmation && (
            <p className="text-red-500 text-xs">{errors.password_confirmation}</p>
          )}
        </div>
      </div>
 
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onSuccess()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  )
}