# JUgaadu - A Hyperlocal Marketplace

JUgaadu is a full-stack web application that creates a hyperlocal marketplace for JU students to buy and sell products. It connects our campus, allowing users to discover products from nearby sellers, engage in real-time chat for negotiations, and complete transactions securely.

## 🚀 Features

  * **User Authentication:** Secure user registration and login functionality.
  * **Product Listings:** Users can create, update, and manage their product listings with images, descriptions, and pricing.
  * **AI-Powered Product Descriptions:** Automatically generate compelling product descriptions using the Google Gemini API.
  * **Marketplace:** A central place to browse and discover products from various sellers.
  * **Search and Filter:** Users can search for products and filter them based on categories, price, and other attributes.
  * **Real-time Chat with Pusher:** Integrated chat functionality for buyers and sellers to communicate and negotiate in real-time.
  * **Cloudinary for Media:** All product images are uploaded and managed through Cloudinary for optimized delivery.
  * **Secure Payments with Razorpay:** Integrated payment gateway to handle transactions securely.
  * **Wishlist:** Users can add products to their wishlist for future reference.
  * **User Profiles:** View and manage user profiles.
  * **My Listings:** A dedicated section for users to view and manage their own product listings.

## 🛠️ Tech Stack

### Frontend

  * [Next.js](https://nextjs.org/) - React framework for server-side rendering and static site generation.
  * [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
  * [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
  * [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
  * [Pusher](https://pusher.com/) - For real-time features like chat.

### Backend

  * [Django](https://www.djangoproject.com/) - A high-level Python web framework.
  * [Django REST Framework](https://www.django-rest-framework.org/) - A powerful and flexible toolkit for building Web APIs.
  * [PostgreSQL](https://www.postgresql.org/) - A powerful, open-source object-relational database system.
  * [Pusher](https://pusher.com/) - For handling real-time chat.
  * [Cloudinary](https://cloudinary.com/) - For cloud-based image and video management.
  * [Razorpay](https://razorpay.com/) - For processing payments.
  * [Google Gemini API](https://ai.google.dev/) - For generative AI features.

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * Node.js and npm/yarn installed
  * Python and pip installed
  * PostgreSQL installed and running
  * A Cloudinary account
  * A Pusher account
  * A Razorpay account
  * A Google Gemini API key

### Installation

1.  **Clone the repository**

    ```sh
    git clone https://github.com/akshat6749/JUgaadu.git
    cd JUgaadu
    ```

2.  **Backend Setup**

    ```sh
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

      * **Create and configure environment variables:**
          * Create a `.env` file in the `backend` directory.
          * Add the following environment variables with your credentials:
            ```env
            # PostgreSQL Database
            DB_NAME=your_db_name
            DB_USER=your_db_user
            DB_PASSWORD=your_db_password
            DB_HOST=localhost
            DB_PORT=5432

            # Cloudinary
            CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
            CLOUDINARY_API_KEY=your_cloudinary_api_key
            CLOUDINARY_API_SECRET=your_cloudinary_api_secret

            # Pusher
            PUSHER_APP_ID=your_pusher_app_id
            PUSHER_KEY=your_pusher_key
            PUSHER_SECRET=your_pusher_secret
            PUSHER_CLUSTER=your_pusher_cluster

            # Razorpay
            RAZORPAY_KEY_ID=your_razorpay_key_id
            RAZORPAY_KEY_SECRET=your_razorpay_key_secret

            # Gemini API
            GEMINI_API_KEY=your_gemini_api_key
            ```
      * **Configure the database in `backend/settings.py`:**
          * Make sure your `settings.py` is configured to read from the `.env` file for your database and other secret keys.
      * **Apply migrations:**
        ```sh
        python manage.py migrate
        ```
      * **Run the backend server:**
        ```sh
        python manage.py runserver
        ```

3.  **Frontend Setup**

    ```sh
    cd ../frontend
    npm install
    ```

      * **Create and configure environment variables:**
          * Create a `.env.local` file in the `frontend` directory.
          * Add the necessary environment variables for connecting to Pusher and Razorpay:
            ```env
            NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
            NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
            NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
            ```
      * **Run the frontend development server:**
        ```sh
        npm run dev
        ```

4.  **Access the application**

      * Open your browser and navigate to `http://localhost:3000`.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Akshat Jaiswal - akshatjaiswal872@gmail.com

Project Link: [https://github.com/akshat6749/JUgaadu](https://github.com/akshat6749/JUgaadu)
