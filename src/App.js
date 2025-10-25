import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, Moon, Sun, Plus, Trash2, Edit2, Check } from 'lucide-react';

const PhysicianPayrollCalculator = () => {
    const [shifts, setShifts] = useState([]);
    const [currentShift, setCurrentShift] = useState({
        date: '',
        hours: '8',
        shiftType: 'day'
    });
    const [isEditingRates, setIsEditingRates] = useState(false);

    // Rate structure - store as percentages for easier editing
    const [rates, setRates] = useState({
        baseRate: 100,
        nightAIncrease: 20,
        nightBIncrease: 27.5
    });

    // Calculate multipliers from percentage increases
    const nightAMultiplier = 1 + (rates.nightAIncrease / 100);
    const nightBMultiplier = 1 + (rates.nightBIncrease / 100);

    const shiftTypes = {
        day: { label: 'Day Shift', multiplier: 1, icon: '☀️' },
        nightA: { label: 'Night Shift A (7pm-3am)', multiplier: nightAMultiplier, icon: '🌙' },
        nightB: { label: 'Night Shift B (10pm-6am)', multiplier: nightBMultiplier, icon: '🌙' }
    };

    const addShift = () => {
        if (currentShift.date && currentShift.hours) {
            setShifts([...shifts, { ...currentShift, id: Date.now() }]);
            setCurrentShift({ date: '', hours: '8', shiftType: 'day' });
        }
    };

    const removeShift = (id) => {
        setShifts(shifts.filter(shift => shift.id !== id));
    };

    // Format date as MM-DD-YY
    const formatDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${month}-${day}-${year}`;
    };

    // Sort shifts by date (oldest to newest)
    const sortedShifts = useMemo(() => {
        return [...shifts].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [shifts]);

    const calculations = useMemo(() => {
        let dayHours = 0;
        let nightAHours = 0;
        let nightBHours = 0;

        shifts.forEach(shift => {
            const hours = parseFloat(shift.hours) || 0;
            if (shift.shiftType === 'nightA') {
                nightAHours += hours;
            } else if (shift.shiftType === 'nightB') {
                nightBHours += hours;
            } else {
                dayHours += hours;
            }
        });

        const totalHours = dayHours + nightAHours + nightBHours;

        // Calculate pay
        const dayPay = dayHours * rates.baseRate;
        const nightAPay = nightAHours * rates.baseRate * nightAMultiplier;
        const nightBPay = nightBHours * rates.baseRate * nightBMultiplier;
        const totalPay = dayPay + nightAPay + nightBPay;

        return {
            dayHours,
            nightAHours,
            nightBHours,
            totalHours,
            dayPay,
            nightAPay,
            nightBPay,
            totalPay
        };
    }, [shifts, rates.baseRate, nightAMultiplier, nightBMultiplier]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Physician Payroll Calculator</h1>
                    <p className="text-gray-600 mb-6">Enter your shifts for the current pay period</p>

                    {/* Rate Structure Display */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-blue-900 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Your Rate Structure
                            </h2>
                            {!isEditingRates ? (
                                <button
                                    onClick={() => setIsEditingRates(true)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition"
                                >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Edit Rates
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingRates(false)}
                                        className="text-green-600 hover:text-green-800 flex items-center text-sm font-medium transition"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isEditingRates ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center">
                                    <Sun className="w-4 h-4 mr-2 text-yellow-600" />
                                    <span className="text-gray-700">Base Rate: <strong>${rates.baseRate}/hour</strong></span>
                                </div>
                                <div className="flex items-center">
                                    <Moon className="w-4 h-4 mr-2 text-indigo-600" />
                                    <span className="text-gray-700">Night A (7pm-3am): <strong>+{rates.nightAIncrease}%</strong> (${(rates.baseRate * nightAMultiplier).toFixed(2)}/hour)</span>
                                </div>
                                <div className="flex items-center">
                                    <Moon className="w-4 h-4 mr-2 text-purple-600" />
                                    <span className="text-gray-700">Night B (10pm-6am): <strong>+{rates.nightBIncrease}%</strong> (${(rates.baseRate * nightBMultiplier).toFixed(2)}/hour)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Sun className="w-4 h-4 inline mr-1 text-yellow-600" />
                                        Base Rate ($/hour)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={rates.baseRate}
                                        onChange={(e) => setRates({ ...rates, baseRate: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Moon className="w-4 h-4 inline mr-1 text-indigo-600" />
                                        Night A % Increase (7pm-3am)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={rates.nightAIncrease}
                                        onChange={(e) => setRates({ ...rates, nightAIncrease: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">${(rates.baseRate * nightAMultiplier).toFixed(2)}/hour</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Moon className="w-4 h-4 inline mr-1 text-purple-600" />
                                        Night B % Increase (10pm-6am)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={rates.nightBIncrease}
                                        onChange={(e) => setRates({ ...rates, nightBIncrease: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">${(rates.baseRate * nightBMultiplier).toFixed(2)}/hour</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Shift Entry Form */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h2 className="font-semibold text-gray-800 mb-4">Add Shift</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={currentShift.date}
                                    onChange={(e) => setCurrentShift({ ...currentShift, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    style={{ colorScheme: 'light', minHeight: '42px' }}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={currentShift.hours}
                                    onChange={(e) => setCurrentShift({ ...currentShift, hours: e.target.value })}
                                    placeholder="8"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type</label>
                                <select
                                    value={currentShift.shiftType}
                                    onChange={(e) => setCurrentShift({ ...currentShift, shiftType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    style={{ minHeight: '42px' }}
                                >
                                    <option value="day">Day Shift</option>
                                    <option value="nightA">Night Shift A (7pm-3am)</option>
                                    <option value="nightB">Night Shift B (10pm-6am)</option>
                                </select>
                            </div>
                            <div className="md:col-span-1 flex items-end">
                                <button
                                    onClick={addShift}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Shift
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Shifts List */}
                    {shifts.length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-semibold text-gray-800 mb-4">Your Shifts This Period</h2>
                            <div className="space-y-2">
                                {sortedShifts.map((shift) => (
                                    <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 rounded-md p-4 gap-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <span className="font-medium text-gray-800">{formatDate(shift.date)}</span>
                                            </div>
                                            <span className="text-gray-600 pl-7 sm:pl-0">{shift.hours} hours</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto ${
                                                shift.shiftType === 'day'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : shift.shiftType === 'nightA'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-purple-100 text-purple-700'
                                            }`}>
                        {shiftTypes[shift.shiftType].icon} {shiftTypes[shift.shiftType].label}
                      </span>
                                        </div>
                                        <button
                                            onClick={() => removeShift(shift.id)}
                                            className="text-red-600 hover:text-red-800 transition self-end sm:self-auto"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pay Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Pay Period Summary</h2>
                        <div className="space-y-3">
                            {calculations.dayHours > 0 && (
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                        <span className="text-gray-700 font-medium">Day Shift</span>
                                        <span className="text-gray-600 text-sm">({calculations.dayHours}h × ${rates.baseRate})</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">${calculations.dayPay.toFixed(2)}</span>
                                </div>
                            )}
                            {calculations.nightAHours > 0 && (
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                        <span className="text-gray-700 font-medium">Night Shift A</span>
                                        <span className="text-gray-600 text-sm">({calculations.nightAHours}h × ${(rates.baseRate * nightAMultiplier).toFixed(2)})</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">${calculations.nightAPay.toFixed(2)}</span>
                                </div>
                            )}
                            {calculations.nightBHours > 0 && (
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                        <span className="text-gray-700 font-medium">Night Shift B</span>
                                        <span className="text-gray-600 text-sm">({calculations.nightBHours}h × ${(rates.baseRate * nightBMultiplier).toFixed(2)})</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">${calculations.nightBPay.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t-2 border-green-300 pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-800">Total Hours:</span>
                                    <span className="text-lg font-bold text-gray-800">{calculations.totalHours.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-2xl font-bold text-gray-900">Total Pay:</span>
                                    <span className="text-3xl font-bold text-green-700">${calculations.totalPay.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {shifts.length > 0 && (
                        <div className="mt-6">
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition">
                                Submit for Approval
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhysicianPayrollCalculator;