"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/API/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Driver, MovementStatus, Truck, TruckStatus } from "@/lib/types";

interface TruckFormProps {
  onSuccess: () => void;
  truck?: Truck | null;
}

export default function TruckForm({ onSuccess, truck }: TruckFormProps) {
  const [driversList, setDriversList] = useState<Driver[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    driver_id: truck?.driver_id?.toString() || "unassigned",
    name: truck?.name || "",
    description: truck?.description || "",
    truck_number: truck?.truck_number || "",
    quantity: truck?.quantity?.toString() || "0",
    compartment: truck?.compartment?.toString() || "0",
    calibrate_one: truck?.calibrate_one?.toString() || "0",
    calibrate_two: truck?.calibrate_two?.toString() || "0",
    calibrate_three: truck?.calibrate_three?.toString() || "0",
    status: (truck?.status || "pending") as TruckStatus,
    movement_status: (truck?.movement_status || "pending") as MovementStatus,
  });

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get("/transporters/drivers");
      setDriversList(data.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers list");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.truck_number.trim()) newErrors.truck_number = "Truck number is required";
    
    // Validate numeric fields
    if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) 
      newErrors.quantity = "Must be a valid number";
    if (isNaN(Number(formData.compartment)) || Number(formData.compartment) < 0)
      newErrors.compartment = "Must be a valid number";
    if (isNaN(Number(formData.calibrate_one)) || Number(formData.calibrate_one) < 0)
      newErrors.calibrate_one = "Must be a valid number";
    if (isNaN(Number(formData.calibrate_two)) || Number(formData.calibrate_two) < 0)
      newErrors.calibrate_two = "Must be a valid number";
    if (isNaN(Number(formData.calibrate_three)) || Number(formData.calibrate_three) < 0)
      newErrors.calibrate_three = "Must be a valid number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        driver_id: formData.driver_id === "unassigned" ? null : Number(formData.driver_id),
        name: formData.name,
        description: formData.description,
        truck_number: formData.truck_number,
        quantity: Number(formData.quantity),
        compartment: Number(formData.compartment),
        calibrate_one: Number(formData.calibrate_one),
        calibrate_two: Number(formData.calibrate_two),
        calibrate_three: Number(formData.calibrate_three),
        status: formData.status,
        movement_status: formData.movement_status,
      };

      const endpoint = truck?.id 
        ? `/transporters/trucks/${truck.id}`
        : "/transporters/trucks";
      
      const method = truck?.id ? "PUT" : "POST";

      const { data } = await api({
        method,
        url: endpoint,
        data: payload,
      });

      toast.success(truck?.id ? "Truck updated successfully" : "Truck created successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Error saving truck:", error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please fix the form errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to save truck");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
        {/* Driver Selection */}
        <div className="space-y-2 col-span-4">
          <Label>Assigned Driver</Label>
          <Select
            value={formData.driver_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, driver_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {driversList.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.first_name} {driver.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Truck Details */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">Name*</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="truck_number">Truck Number*</Label>
          <Input
            id="truck_number"
            value={formData.truck_number}
            onChange={handleChange}
            className={errors.truck_number ? "border-red-500" : ""}
          />
          {errors.truck_number && (
            <p className="text-red-500 text-xs">{errors.truck_number}</p>
          )}
        </div>

        <div className="space-y-2 col-span-4">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Numeric Fields */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity*</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className={errors.quantity ? "border-red-500" : ""}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs">{errors.quantity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="compartment">Compartment*</Label>
          <Input
            id="compartment"
            type="number"
            min="0"
            value={formData.compartment}
            onChange={handleChange}
            className={errors.compartment ? "border-red-500" : ""}
          />
          {errors.compartment && (
            <p className="text-red-500 text-xs">{errors.compartment}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="calibrate_one">Calibrate One</Label>
          <Input
            id="calibrate_one"
            type="number"
            min="0"
            value={formData.calibrate_one}
            onChange={handleChange}
            className={errors.calibrate_one ? "border-red-500" : ""}
          />
          {errors.calibrate_one && (
            <p className="text-red-500 text-xs">{errors.calibrate_one}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="calibrate_two">Calibrate Two</Label>
          <Input
            id="calibrate_two"
            type="number"
            min="0"
            value={formData.calibrate_two}
            onChange={handleChange}
            className={errors.calibrate_two ? "border-red-500" : ""}
          />
          {errors.calibrate_two && (
            <p className="text-red-500 text-xs">{errors.calibrate_two}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="calibrate_three">Calibrate Three</Label>
          <Input
            id="calibrate_three"
            type="number"
            min="0"
            value={formData.calibrate_three}
            onChange={handleChange}
            className={errors.calibrate_three ? "border-red-500" : ""}
          />
          {errors.calibrate_three && (
            <p className="text-red-500 text-xs">{errors.calibrate_three}</p>
          )}
        </div>

        {/* Status Fields */}
        <div className="space-y-2 col-span-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: TruckStatus) =>
              setFormData(prev => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="moving">Moving</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Movement Status</Label>
          <Select
            value={formData.movement_status}
            onValueChange={(value: MovementStatus) =>
              setFormData(prev => ({ ...prev, movement_status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select movement status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="moving">Moving</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : truck?.id
            ? "Update Truck"
            : "Add Truck"}
        </Button>
      </div>
    </form>
  );
}