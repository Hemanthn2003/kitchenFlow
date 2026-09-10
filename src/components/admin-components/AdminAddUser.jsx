import React, {
  useState,
} from "react";

import Icon from "../Icon.jsx";

import {
  uploadAdminUserImage,
} from "./AdminFunctions.js";


const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "WAITER",
  imageUrl: "",
};


const AdminAddUser = ({
  onAdd,
  loading = false,
  onCancel,
}) => {

  const [form, setForm] =
    useState(initialForm);


  const [showPassword, setShowPassword] =
    useState(false);


  const [uploadingImage, setUploadingImage] =
    useState(false);


  const [imageUploadError, setImageUploadError] =
    useState("");


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  const handleImageChange = async (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    setImageUploadError("");


    try {

      setUploadingImage(true);


      const imageUrl =
        await uploadAdminUserImage(
          file
        );


      setForm(
        (previous) => ({
          ...previous,
          imageUrl,
        })
      );

    } catch (error) {

      console.error(
        "Employee image upload error:",
        error
      );


      setImageUploadError(
        error?.message ||
          "Unable to upload employee image."
      );

    } finally {

      setUploadingImage(false);

      event.target.value = "";

    }

  };


  const removeImage = () => {

    setForm(
      (previous) => ({
        ...previous,
        imageUrl: "",
      })
    );


    setImageUploadError("");

  };


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (uploadingImage) {
      return;
    }


    const success =
      await onAdd(form);


    if (success) {

      setForm(
        initialForm
      );


      setShowPassword(
        false
      );


      setImageUploadError("");

    }

  };


  return (
    <section className="admin-add-user">

      <div className="admin-add-user-heading">

        <div className="admin-add-user-icon">

          <Icon
            name="plus"
            size={22}
          />

        </div>


        <div>

          <span>
            EMPLOYEE MANAGEMENT
          </span>


          <h2>
            Add New User
          </h2>


          <p>
            Create a new KitchenFlow
            employee account.
          </p>

        </div>

      </div>


      <form
        className="admin-user-form"
        onSubmit={handleSubmit}
      >

        <div className="admin-form-grid">

          {/* NAME */}

          <label>

            <span>
              FULL NAME
            </span>


            <input
              type="text"
              name="name"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="Enter full name"
              required
              disabled={
                loading ||
                uploadingImage
              }
            />

          </label>


          {/* EMAIL */}

          <label>

            <span>
              EMAIL
            </span>


            <input
              type="email"
              name="email"
              value={form.email}
              onChange={
                handleChange
              }
              placeholder="employee@kitchenflow.com"
              required
              disabled={
                loading ||
                uploadingImage
              }
            />

          </label>


          {/* PASSWORD */}

          <label>

            <span>
              PASSWORD
            </span>


            <div className="admin-password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={
                  handleChange
                }
                placeholder="Create password"
                required
                disabled={
                  loading ||
                  uploadingImage
                }
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) =>
                      !value
                  )
                }
                disabled={
                  loading ||
                  uploadingImage
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                <Icon
                  name={
                    showPassword
                      ? "eye-off"
                      : "eye"
                  }
                  size={16}
                />

              </button>

            </div>

          </label>


          {/* ROLE */}

          <label>

            <span>
              ROLE
            </span>


            <select
              name="role"
              value={form.role}
              onChange={
                handleChange
              }
              disabled={
                loading ||
                uploadingImage
              }
            >

              <option value="WAITER">
                WAITER
              </option>


              <option value="KITCHEN">
                KITCHEN
              </option>


              <option value="MANAGER">
                MANAGER
              </option>

            </select>

          </label>


          {/* PROFILE IMAGE */}

          <div className="admin-user-image-field">

            <span className="admin-user-image-label">
              PROFILE IMAGE
            </span>


            <div className="admin-user-image-upload">

              <div className="admin-user-image-preview">

                {form.imageUrl ? (

                  <img
                    src={form.imageUrl}
                    alt={
                      form.name ||
                      "Employee preview"
                    }
                  />

                ) : (

                  <Icon
                    name="user"
                    size={28}
                  />

                )}

              </div>


              <div className="admin-user-image-controls">

                <label
                  className="admin-image-upload-button"
                >

                  <Icon
                    name="plus"
                    size={16}
                  />


                  {uploadingImage
                    ? "Uploading..."
                    : form.imageUrl
                      ? "Change Image"
                      : "Add Image"}


                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    disabled={
                      loading ||
                      uploadingImage
                    }
                    hidden
                  />

                </label>


                {form.imageUrl && (

                  <button
                    type="button"
                    className="admin-image-remove-button"
                    onClick={
                      removeImage
                    }
                    disabled={
                      loading ||
                      uploadingImage
                    }
                  >
                    Remove
                  </button>

                )}


                <small>
                  JPG, PNG or WEBP · Max 5 MB
                </small>

              </div>

            </div>


            {imageUploadError && (

              <div className="admin-image-upload-error">
                {imageUploadError}
              </div>

            )}

          </div>

        </div>


        <div className="admin-form-actions">

          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              loading ||
              uploadingImage
            }
          >

            <Icon
              name={
                loading
                  ? "activity"
                  : "plus"
              }
              size={16}
            />


            {loading
              ? "Creating..."
              : "Create User"}

          </button>


          {onCancel && (

            <button
              type="button"
              className="admin-secondary-button"
              onClick={onCancel}
              disabled={
                loading ||
                uploadingImage
              }
            >
              Cancel
            </button>

          )}

        </div>

      </form>

    </section>
  );
};


export default AdminAddUser;