<?php
// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $name = $_POST["name"];
    $email = $_POST["email"];
    $message = $_POST["message"];

    // You can add further validation and processing here

    // Example: Send an email (you might need to configure your server for this)
    $to = "your-email@example.com";
    $subject = "New Form Submission";
    $headers = "From: $email";

    // Compose the email body
    $body = "Name: $name\n";
    $body .= "Email: $email\n\n";
    $body .= "Message:\n$message";

    // Send the email
    mail($to, $subject, $body, $headers);
}
?>

<!-- Add a simple response message -->
<html>
<head>
    <title>Form Submission Result</title>
</head>
<body>
    <p>Thank you for your submission! We will get back to you soon.</p>
</body>
</html>
