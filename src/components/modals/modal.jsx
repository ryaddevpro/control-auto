"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaUserPlus } from "react-icons/fa";

const Modal = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`http://localhost:3000/api/client/`, {
        method: "POST", // Specify the POST method
        headers: {
          "Content-Type": "application/json", // Set the Content-Type header if needed
          Authorization: `Bearer ${await getToken()}`,
        },
        // Add body if you want to send data along with the POST request
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      // If you expect a response, you can handle it here
      const okResponse = await response.json();
      document.getElementById("my_modal_3").close();
      toast.success("client cree avec success!");
      reset();
      router.refresh();

      return okResponse;
    } catch (error) {
      console.error("Error:", error);
      toast.error("une erreur est survenu");
    }
  };

  // Define an array of input field configurations
  const inputFields = [
    { id: "nom", label: "Nom", placeholder: "Enter your name", type: "text" },
    {
      id: "prenom",
      label: "Prenom",
      placeholder: "Enter your email",
      type: "text",
    },
    { id: "cin", label: "CIN", placeholder: "Enter your CIN", type: "text" },
    {
      id: "num_tel",
      label: "Numéro de Téléphone",
      placeholder: "Enter your phone number",
      type: "text",
    },
    {
      id: "prix_total",
      label: "Prix Total",
      placeholder: "Enter total price",
      type: "number",
    },
    {
      id: "prix_paye",
      label: "Prix Payé",
      placeholder: "Enter paid price",
      type: "number",
      required: false,
    },
    { id: "date_exam", label: "Date of Exam", type: "date", required: false },
  ];

  return (
    <div>
      <button
        className="btn btn-secondary flex items-center gap-2 h-auto"
        onClick={() => document.getElementById("my_modal_3").showModal()}
      >
        <FaUserPlus size={18} />
        Ajouter un nouveau client{" "}
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleSubmit(onSubmit)}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              ✕
            </button>
            <div className="mx-auto max-w-4xl space-y-8 px-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Join the Club</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter your information to sign up
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inputFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor={field.id}
                      >
                        {field.label}
                      </label>
                      <input
                        {...register(field.id, {
                          required:
                            field.required !== undefined
                              ? field.required
                              : true,
                        })}
                        className="flex h-10 w-full input input-primary focus:border-none"
                        id={field.id}
                        placeholder={field.placeholder}
                        type={field.type}
                      />
                      {errors[field.id] && (
                        <p className="text-red-500">This field is required</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex w-full justify-end">
                  <button
                    type="submit"
                    className="btn btn-secondary text-lg w-full md:w-auto"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default Modal;
