import { useState } from 'react';
import { useNotification } from '../context';
import { useProducts } from '../context';

export function useProductManager() {
    const { showNotification } = useNotification();
    const { products, updateProduct, deleteProduct, addProduct } = useProducts();
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const deleteItem = (id) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(id);
            showNotification('success', 'Producto eliminado');
        }
    };

    const startEditing = (product) => {
        setEditingId(product.id);
        setEditForm({ ...product });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveChanges = () => {
        updateProduct(editForm);
        setEditingId(null);
        showNotification('success', 'Producto actualizado correctamente');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? Number(value) : value
        }));
    };

    const handleImageChange = (e) => {
        setEditForm(prev => ({
            ...prev,
            images: [e.target.value]
        }));
    };

    return {
        products,
        editingId,
        editForm,
        deleteItem,
        startEditing,
        cancelEditing,
        saveChanges,
        handleFormChange,
        handleImageChange
    };
}
