
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";

import "./Profile.css";

function Profile() {
    const { user, setUser, token } = useAuth();

    const [edit, setEdit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [inputValue, setInputValue] = useState({
        username: "",
        email: "",
        description: "",
        avatar: null
    });

    const [avatarPreview, setAvatarPreview] = useState("");

    // Initialisation des informations utilisateur
    useEffect(() => {
        if (user) {
            setInputValue({
                username: user.username || "",
                email: user.email || "",
                description: user.description || "",
                avatar: null
            });

            setAvatarPreview(user.avatar || "");
        }
    }, [user]);

    // Activation / désactivation du mode édition
    function handleChangeInfos(field) {
        setEdit(edit === field ? null : field);
    }

    // Modification des champs
    function handleInputChange(e) {
        const { name, value } = e.target;

        setInputValue(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Gestion de l'upload de l'avatar
    function handleAvatarChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        // Vérification du format
        if (!file.type.startsWith("image/")) {
            setMessage("Veuillez sélectionner une image.");
            return;
        }

        // Vérification de la taille (5 Mo maximum)
        if (file.size > 5 * 1024 * 1024) {
            setMessage("L'image ne doit pas dépasser 5 Mo.");
            return;
        }

        setInputValue(prev => ({
            ...prev,
            avatar: file
        }));

        // Aperçu de l'image sélectionnée
        const previewUrl = URL.createObjectURL(file);

        setAvatarPreview(previewUrl);
        setMessage("");
    }

    // Enregistrement des modifications
    async function handleSubmitProfile(e) {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();

            formData.append("username", inputValue.username);
            formData.append("email", inputValue.email);
            formData.append("description", inputValue.description);

            // Envoi uniquement si un nouvel avatar a été sélectionné
            if (inputValue.avatar) {
                formData.append("avatar", inputValue.avatar);
            }

            const response = await fetch(
                "http://localhost:3000/user/profile",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Erreur lors de la modification"
                );
            }

            // Mise à jour du contexte utilisateur
            const updatedUser = {
                ...user,
                ...result.user
            };

            setUser(updatedUser);

            // Mise à jour du chemin de l'avatar
            setAvatarPreview(updatedUser.avatar || "");

            // Réinitialisation du fichier sélectionné
            setInputValue(prev => ({
                ...prev,
                avatar: null
            }));

            setMessage("Les modifications ont été enregistrées !");
            setEdit(null);

        } catch (err) {
            console.error(err);
            setMessage(
                err.message || "Une erreur est survenue lors de la modification."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h1>Page de profil</h1>

            <Box
                component="form"
                onSubmit={handleSubmitProfile}
                sx={{
                    width: "45vw",
                    padding: "2rem",
                    border: "solid 1px lightgrey",
                    margin: "auto",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px"
                }}
            >

                {/* Avatar */}
                <div>
                    <Avatar
                        sx={{
                            width: "5rem",
                            height: "5rem",
                            margin: "auto"
                        }}
                        src={
                            avatarPreview.startsWith("blob:")
                                ? avatarPreview
                                : avatarPreview
                                    ? `http://localhost:3000${avatarPreview}`
                                    : ""
                        }
                        alt={user?.username || "Avatar"}
                    />

                    <input
                        type="file"
                        id="avatar-upload"
                        name="avatar"
                        accept="image/png, image/jpeg, image/webp"
                        hidden
                        onChange={handleAvatarChange}
                    />

                    <label htmlFor="avatar-upload">
                        <EditOutlinedIcon
                            sx={{ cursor: "pointer" }}
                        />
                    </label>
                </div>

                {/* Username */}
                <div className="profile-row">
                    <h2>Username :</h2>

                    {edit === "username" ? (
                        <TextField
                            name="username"
                            variant="outlined"
                            value={inputValue.username}
                            onChange={handleInputChange}
                        />
                    ) : (
                        <h2>{inputValue.username}</h2>
                    )}

                    <EditOutlinedIcon
                        onClick={() => handleChangeInfos("username")}
                        sx={{ cursor: "pointer" }}
                    />
                </div>

                {/* Email */}
                <div className="profile-row">
                    <h2>Email :</h2>

                    {edit === "email" ? (
                        <TextField
                            name="email"
                            variant="outlined"
                            value={inputValue.email}
                            onChange={handleInputChange}
                        />
                    ) : (
                        <h2>{inputValue.email}</h2>
                    )}

                    <EditOutlinedIcon
                        onClick={() => handleChangeInfos("email")}
                        sx={{ cursor: "pointer" }}
                    />
                </div>

                {/* Description */}
                <div className="profile-row">
                    <h2>Description :</h2>

                    {edit === "description" ? (
                        <TextField
                            name="description"
                            variant="outlined"
                            multiline
                            value={inputValue.description}
                            onChange={handleInputChange}
                        />
                    ) : (
                        <h2>{inputValue.description}</h2>
                    )}

                    <EditOutlinedIcon
                        onClick={() => handleChangeInfos("description")}
                        sx={{ cursor: "pointer" }}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Enregistrement..."
                        : "Enregistrer les modifications"}
                </Button>

                {message && <p>{message}</p>}

            </Box>
        </>
    );
}

export default Profile;
