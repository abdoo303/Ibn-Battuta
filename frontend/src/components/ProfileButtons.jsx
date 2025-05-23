import React from "react";
import { color, styled } from "@mui/system"; // Or import styled from "styled-components" if using styled-components

// Base Button Style
const Button = styled("button")({
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: 160,
});

// Specific Button Styles
const ChangePassword = styled(Button)({
    height: 50,
    background: "white",
    borderRadius: 100,
    border: "1px black solid",
    color: "black",
});

const DeleteAccount = styled(Button)({
    height: 50,
    background: "white",
    borderRadius: 100,
    border: "1px #D00C09 solid",
    color: "red",
});

// Main Button Component that conditionally renders based on buttonType prop
const ProfileButton = ({ buttonType, onClick }) => {
    return (
        <>
            {buttonType === "changePassword" && (
                <ChangePassword onClick={onClick}>Change Password</ChangePassword>
            )}
            {buttonType === "deleteAccount" && (
                <DeleteAccount onClick={onClick}>Delete Account</DeleteAccount>
            )}
            {buttonType === "editProfile" && (
                <EditProfile onClick={onClick}>Edit Profile</EditProfile>
            )}
            {buttonType === "saveProfile" && (
                <SaveProfile onClick={onClick}>Save Profile</SaveProfile>
            )}
        </>
    );
};

export default ProfileButton;
