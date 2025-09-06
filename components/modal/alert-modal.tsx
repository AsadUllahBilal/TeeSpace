'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  loading: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  productId,
  loading
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const deleteProduct = async (id: string) => {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete product');
    }

    const data = await res.json();
    onClose();
    router.push("/dashboard/product")
  } catch (err) {
    console.error(err);
  }
};

  return (
    <Modal
      title='Are you sure?'
      description='This action cannot be undone.'
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' className='cursor-pointer' onClick={onClose}>
          Cancel
        </Button>
        <Button variant='destructive' className='cursor-pointer' onClick={() => deleteProduct(productId)}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};
