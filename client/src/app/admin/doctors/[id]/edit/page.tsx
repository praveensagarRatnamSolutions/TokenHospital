'use client';

import { DoctorProfileEdit } from '@/modules/admin/doctors';
import { useParams } from 'next/navigation';

export default function EditDoctorPage() {
    const params = useParams();
    const id = params.id as string;

    return <DoctorProfileEdit doctorId={id} />;
}
