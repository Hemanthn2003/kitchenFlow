import React, {
  useEffect,
  useState,
} from "react";

import Icon from "../Icon.jsx";

import {
  uploadAdminUserImage,
} from "./AdminFunctions.js";


const AdminEditUserModal = ({
  user,
  onClose,
  onSave,
  loading = false,
}) => {

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      imageUrl: "",
    });


  const [showPassword, setShowPassword] =
    useState(false);


  const [uploadingImage, setUploadingImage] =
    useState(false);


  const [imageUploadError, setImageUploadError] =
    useState("");


  useEffect(() => {

    if (!user) {
      return;
    }


    setForm({
      name:
        user.name || "",

      email:
        user.email || "",

      password:
        "",

      imageUrl:
        user.imageUrl ||
        user.profileImage ||
        "",
    });


    setShowPassword(false);

    setImageUploadError("");

  }, [user]);


  if (!user) {
    return null;
  }


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


    await onSave(
      user,
      form
    );

  };


  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div
        className="admin-edit-modal"
        role="dialog"
        aria-modal="true"
      >

        <div className="admin-modal-heading">

          <div>

            <span>
              EMPLOYEE
            </span>


            <h2>
              Edit User
            </h2>

          </div>


          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            disabled={
              loading ||
              uploadingImage
            }
          >

            <Icon
              name="close"
              size={18}
            />

          </button>

        </div>


        <div className="admin-edit-user-preview">

          <div className="admin-edit-avatar">

            {form.imageUrl ? (

              <img
                src={form.imageUrl}
                alt={
                  user.name ||
                  "Employee"
                }
              />

            ) : (

              <Icon
                name="user"
                size={25}
              />

            )}

          </div>


          <div>

            <strong>
              {user.name}
            </strong>


            <span>
              {String(
                user.role || ""
              ).toUpperCase()}
            </span>

          </div>

        </div>


        <form
          className="admin-edit-form"
          onSubmit={handleSubmit}
        >

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
              required
              disabled={
                loading ||
                uploadingImage
              }
            />

          </label>


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
              required
              disabled={
                loading ||
                uploadingImage
              }
            />

          </label>


          <label>

            <span>

              NEW PASSWORD

              <small>
                Leave blank to keep current
              </small>

            </span>


            <div className="admin-password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder="Optional"
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
                      user.name ||
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


          <div className="admin-modal-actions">

            <button
              type="button"
              className="admin-secondary-button"
              onClick={onClose}
              disabled={
                loading ||
                uploadingImage
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="admin-primary-button"
              disabled={
                loading ||
                uploadingImage
              }
            >

              <Icon
                name="check"
                size={16}
              />


              {loading
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


export default AdminEditUserModal;