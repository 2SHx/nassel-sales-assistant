
import React from 'react';
import { Map, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MapPreviewWidget: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="col-span-1 md:col-span-2 relative h-64 rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/50 shadow-xl shadow-purple-900/5"
            onClick={() => navigate('/map')}
        >
            {/* Background Image (Static Map Placeholder) */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/46.6753,24.7136,10,0/800x400?access_token=YOUR_TOKEN')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0">
                {/* Fallback gradient if image fails or for styling */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b4e]/90 via-[#7434bc]/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end items-start text-white">
                <div className="mb-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                    <Map className="w-4 h-4 text-emerald-300" />
                    <span className="text-xs font-bold tracking-wide">الخريطة التفاعلية</span>
                </div>

                <h3 className="text-3xl font-black mb-2">استكشف المشاريع على الخريطة</h3>
                <p className="text-purple-100 font-medium mb-6 max-w-md">
                    شاهد توزيع المشاريع، الأسعار، وحالة الوحدات في نظرة واحدة.
                </p>

                <button className="bg-white text-[#7434bc] px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-transform group-hover:-translate-y-1 shadow-lg group-hover:shadow-white/20">
                    تصفح الخريطة الآن
                    <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
            </div>

            {/* Decorative Pins */}
            <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-bounce shadow-lg shadow-emerald-500/50" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-bounce shadow-lg shadow-orange-500/50" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-[#7434bc] rounded-full border-2 border-white animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDelay: '1s' }} />
        </div>
    );
};
