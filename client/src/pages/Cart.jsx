import React, { useEffect, useState } from 'react'
import { useCart } from '../context/cart'
import { useAuth } from '../context/auth'
import { Link, useNavigate } from 'react-router-dom'
import DropIn from "braintree-web-drop-in-react";
import axios from 'axios'
import { HiOutlineTrash } from 'react-icons/hi'
import toast from 'react-hot-toast';

const Cart = () => {
    const [cart, setcart] = useCart();
    const [auth, setAuth] = useAuth();
    const [clientToken, setClientToken] = useState("");
    const [instance, setInstance] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const [price, setPrice] = useState(0);


    const totalPrice = () => {
        try {
            let total = 0;
            cart?.map((item) => {
                const po = item.price.replace(' lakh', '')
                total = total + parseInt(po);
            });
            return total.toLocaleString("en-US", {
                style: "currency",
                currency: "pkr",
            });
   
        } catch (error) {
            console.log(error);
        }
    };
    

    const removeCartItem = (pid) => {
        try {
            let myCart = [...cart]
            let index = myCart.findIndex(item => item._id === pid)
            myCart.splice(index, 1)
            setcart(myCart)
            localStorage.setItem('cart', JSON.stringify(myCart))
        } catch (err) {
            console.log(err)
        }
    }

    const getToken = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/car/braintree/token`);
            setClientToken(data?.clientToken);
        } catch (error) {
            console.log(error);
        }
    };
    
const handlePayment = async () => {
  try {
    console.log(cart);
    
    const response = await axios.post(`http://localhost:8000/create-checkout-session-multiple`, {
      items: cart?.map(item => ({
        name: item.name,
        description: item.description || "No description",
        price: item.price
      })),
      
      customerName: auth?.user?.name || "Guest",
      customerEmail: auth?.user?.email || "guest@example.com",
      customerPhone: "03001234567" // Replace with real user input or form field
    });

    if (response.status === 200) {
      window.location.href = response.data.url;
    } else {
      toast.error("Failed to create checkout session.");
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    toast.error("Server error! Please try again.");
  }
};

    useEffect(() => {
        getToken();
             setPrice(totalPrice().replace("PKR", ""))
        window.scrollTo(0, 0)
    }, [auth?.token]);


    const notify = () => toast.success('Item Removed Successfully')

    return (
        <div className='my-5'>
            <section className="h-100 h-custom">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col">
                            <div className="card">
                                <div className="card-body p-4">
                                    <div className="row">
                                        <div className="col-lg-7">
                                            <h5 className="mb-3">{!auth?.user
                                                ? "Hello Guest"
                                                : `Hello  ${auth?.token && auth?.user?.name}`}
                                            </h5>
                                            <hr />

                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <div>
                                                    <p className="mb-1">Shopping cart</p>
                                                    <p className="mb-0">{cart?.length
                                                        ? `You Have ${cart.length} items in your cart ${auth?.token ? "" : "please login to checkout !"
                                                        }`
                                                        : " Your Cart Is Empty"}
                                                    </p>
                                                </div>
                                            </div>

                                            {cart?.map((p) => (
                                                <div className="card my-3 mb-lg-0">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between">
                                                            <div className="d-flex flex-row align-items-center">
                                                                <div>
                                                                    <Link to={`/car/${p.slug}`} className='text-center'>
                                                                        <img
                                                                            src={`${process.env.REACT_APP_API_URL}/images/${p.productPictures[0]}`}
                                                                            className="card-img-top"
                                                                            alt={p.name}
                                                                            style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }}
                                                                        />
                                                                    </Link>

                                                                </div>
                                                                <div className="mx-2">
                                                                    <p className='sizePrice'><span className='badge rounded-pill text-bg-primary'>{p.brand.name}</span></p>
                                                                    <p className="sizePrice">{p.name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="sizePrice"> RS {p.price} Lakhs</p>
                                                                <button
                                                                    className="btn btn-danger"
                                                                    onClick={() => { removeCartItem(p._id); notify() }}
                                                                >
                                                                    <HiOutlineTrash size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="col-lg-5">
                                            <div className="card text-white rounded-3 cartStyle">
                                                <div className='card-body'>
                                                    <div className="text-center">
                                                        <h2>Cart Summary</h2>
                                                        <p>Total | Checkout | Payment</p>
                                                        <hr />
                                                        <h4>Total : {totalPrice()} Lakhs</h4>
                                                   <button
  className="btn btn-dark mt-3"
  onClick={handlePayment}
>
  {loading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Processing...
    </>
  ) : (
    "Make Payment"
  )}
</button>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    )
}

export default Cart
