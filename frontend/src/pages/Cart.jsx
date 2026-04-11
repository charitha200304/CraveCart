import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();

  const total = getCartTotal();
  const deliveryFee = total > 0 ? 150 : 0;
  const grandTotal = total + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <main className={styles.page}>
        <div className="container">
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>
              <ShoppingCart size={48} />
            </div>
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyText}>
              Looks like you have not added anything to your cart yet
            </p>
            <Link to="/restaurants" className="btn btn-primary">
              Browse Restaurants
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Your Cart</h1>
          <button onClick={clearCart} className={styles.clearBtn}>
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.items}>
            {cartItems.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>{item.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>Rs. {item.price.toFixed(2)}</p>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantity}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className={styles.quantityValue}>{item.quantity}</span>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <p className={styles.itemTotal}>
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                  
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`}>
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            <Link to="/restaurants" className={styles.continueLink}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
