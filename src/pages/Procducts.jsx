import React, { useState } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiCheck } from 'react-icons/fi';
import { useInventory } from './InventoryContext'; 

const Products = () => {
  const {
    products,
    loading,
    error,
    viewProduct,
    updateProduct,
    deleteProduct,
  } = useInventory();

  // Interactive UI Action States
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ product_name: '', quantity: '', category: '', price: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ==========================================
  // ACTION HANDLERS (ICON FUNCTIONS)
  // ==========================================

  // 1. VIEW FUNCTION
  const handleView = async (code) => {
    try {
      const data = await viewProduct(code);
      setViewingProduct(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error pulling product record details.');
    }
  };

  // 2. EDIT BUTTON INITIALIZER
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditForm({
      product_name: product.product_name || '',
      quantity: product.quantity || 0,
      category: product.category || '',
      price: product.price || 0,
    });
  };

  // 2b. EDIT SUBMITTER — uses context so Dashboard reflects changes instantly
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(editingProduct.unique_code, editForm);
      setEditingProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating product record.');
    }
  };

  // 3. DELETE FUNCTION — uses context so Dashboard count updates immediately
  const handleDelete = async (code) => {
    if (window.confirm('Are you sure you want to permanently delete this product document?')) {
      try {
        await deleteProduct(code);
        // Re-evaluate page offset after deletion
        const updatedTotalPages = Math.ceil((products.length - 1) / itemsPerPage);
        if (currentPage > updatedTotalPages && updatedTotalPages > 0) {
          setCurrentPage(updatedTotalPages);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error executing delete request.');
      }
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Stock badge helper — three tiers: Out of Stock / Low Stock / In Stock
  const LOW_STOCK_THRESHOLD = 10;
  const getStockBadge = (quantity) => {
    if (quantity === 0) {
      return <span style={styles.badgeOut}>Out of Stock</span>;
    }
    if (quantity <= LOW_STOCK_THRESHOLD) {
      return <span style={styles.badgeLow}>{quantity} Low Stock</span>;
    }
    return <span style={styles.badgeIn}>{quantity} In Stock</span>;
  };

  if (loading) return <div style={styles.centerNotice}>Loading inventory payload metadata...</div>;
  if (error) return <div style={styles.errorNotice}>Error: {error}</div>;

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <h2 style={styles.title}>Product Management</h2>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.thNum}>S/N</th>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Code / SKU</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock Status</th>
                <th style={styles.thCentered}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((product, index) => (
                  <tr key={product._id} style={styles.tr}>
                    <td style={styles.tdNum}>{indexOfFirstItem + index + 1}</td>
                    <td style={styles.td}><strong>{product.product_name}</strong></td>
                    <td style={styles.td}><code style={styles.codeTag}>{product.unique_code || 'N/A'}</code></td>
                    <td style={styles.td}>${Number(product.price).toFixed(2)}</td>
                    <td style={styles.td}>{getStockBadge(product.quantity)}</td>
                    <td style={styles.tdCentered}>
                      <div style={styles.actionGroup}>
                        <button onClick={() => handleView(product.unique_code)} style={{ ...styles.actionBtn, ...styles.viewBtn }} title="View Details"><FiEye size={15} /></button>
                        <button onClick={() => handleEditClick(product)} style={{ ...styles.actionBtn, ...styles.editBtn }} title="Edit Field Properties"><FiEdit2 size={15} /></button>
                        <button onClick={() => handleDelete(product.unique_code)} style={{ ...styles.actionBtn, ...styles.deleteBtn }} title="Delete Document Record"><FiTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.noData}>No storage records match database criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={styles.pageBtn}><FiChevronLeft size={18} /></button>
            <span style={styles.pageInfo}>Page <strong>{currentPage}</strong> of {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={styles.pageBtn}><FiChevronRight size={18} /></button>
          </div>
        )}

        {/* VIEW MODAL */}
        {viewingProduct && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3>Product Properties Detail View</h3>
                <button onClick={() => setViewingProduct(null)} style={styles.closeIconBtn}><FiX size={20} /></button>
              </div>
              <div style={styles.modalBody}>
                <p><strong>DB Document ID:</strong> {viewingProduct._id}</p>
                <p><strong>Name String:</strong> {viewingProduct.product_name}</p>
                <p><strong>Unique Code (SKU):</strong> {viewingProduct.unique_code}</p>
                <p><strong>Category Segment:</strong> {viewingProduct.category || 'Uncategorized'}</p>
                <p><strong>Unit Asset Value Price:</strong> ${Number(viewingProduct.price).toFixed(2)}</p>
                <p><strong>Quantity In Warehouse:</strong> {viewingProduct.quantity} count units</p>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editingProduct && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3>Edit Target Fields ({editingProduct.unique_code})</h3>
                <button onClick={() => setEditingProduct(null)} style={styles.closeIconBtn}><FiX size={20} /></button>
              </div>
              <form onSubmit={handleEditSubmit} style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Product Title Variant Name</label>
                  <input type="text" value={editForm.product_name} onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })} style={styles.inputField} required />
                </div>
                <div>
                  <label style={styles.label}>Category String Tag</label>
                  <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={styles.inputField} />
                </div>
                <div>
                  <label style={styles.label}>Price Unit Float ($)</label>
                  <input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={styles.inputField} required />
                </div>
                <div>
                  <label style={styles.label}>Stock Quantity Integer Counter</label>
                  <input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} style={styles.inputField} required />
                </div>
                <div style={styles.formActionFooter}>
                  <button type="button" onClick={() => setEditingProduct(null)} style={styles.cancelFormBtn}>Cancel</button>
                  <button type="submit" style={styles.saveFormBtn}><FiCheck size={16} style={{ marginRight: '4px' }} /> Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageBackground: { backgroundColor: '#1e293b', minHeight: '100vh', width: '100%' },
  container: { padding: '32px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  title: { marginBottom: '24px', fontSize: '24px', fontWeight: '600', color: '#f8fafc' },
  tableWrapper: { backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '.5px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#1e293b', borderBottom: '2px solid #334155' },
  th: { padding: '16px', fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  thNum: { padding: '16px 16px 16px 24px', fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', width: '60px' },
  thCentered: { padding: '16px', fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' },
  tr: { borderBottom: '1px solid #334155', backgroundColor: '#0f172a' },
  td: { padding: '16px', fontSize: '14px', color: '#cbd5e1' },
  tdNum: { padding: '16px 16px 16px 24px', fontSize: '14px', color: '#64748b', fontWeight: '500' },
  codeTag: { fontFamily: 'monospace', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8' },
  tdCentered: { padding: '16px', textAlign: 'center' },
  actionGroup: { display: 'inline-flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s, transform 0.1s' },
  viewBtn: { backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' },
  editBtn: { backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  badgeIn: { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  badgeLow: { backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#facc15', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  badgeOut: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' },
  pageBtn: { display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', padding: '8px', cursor: 'pointer' },
  pageInfo: { fontSize: '14px', color: '#94a3b8' },
  centerNotice: { padding: '80px 24px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#1e293b', minHeight: '100vh' },
  errorNotice: { padding: '80px 24px', textAlign: 'center', color: '#f87171', backgroundColor: '#1e293b', minHeight: '100vh' },
  noData: { padding: '32px', textAlign: 'center', color: '#94a3b8' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalContent: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', color: '#cbd5e1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '14px', marginBottom: '16px' },
  closeIconBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' },
  inputField: { width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  formActionFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid #334155', paddingTop: '16px' },
  cancelFormBtn: { backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px' },
  saveFormBtn: { display: 'flex', alignItems: 'center', backgroundColor: '#38bdf8', border: 'none', color: '#0f172a', borderRadius: '8px', padding: '10px 18px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
};

export default Products;